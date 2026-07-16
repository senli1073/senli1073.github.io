const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const index = read('index.html');
const scripts = read('static/js/scripts.js');
const mainCss = read('static/css/main.css');
const config = read('contents/config.yml');
const gitignore = read('.gitignore');

function countMatches(text, pattern) {
  return [...text.matchAll(pattern)].length;
}

assert.equal(index.includes('polyfill.io'), false, 'polyfill.io must not be loaded');
assert.equal(countMatches(index, /id="MathJax-script"/g), 1, 'MathJax should be loaded exactly once');
assert.equal(countMatches(index, /mathjax@3\/es5\/tex-[^"]+\.js/g), 1, 'Only one MathJax component bundle should be loaded');
assert.equal(
  /<link[^>]+static\/css\/styles\.css/.test(index) && /@import\s+["']\.\/styles\.css["']/.test(mainCss),
  false,
  'styles.css should not be loaded both directly and through main.css'
);
assert.equal(index.includes(' mt5 '), false, 'invalid mt5 class should not be used');
assert.equal(index.includes(' md5'), false, 'invalid md5 class should not be used');
assert.match(index, /<img\b[^>]*\balt="/, 'profile image should include alt text');
assert.equal(mainCss.includes('background-size: fill'), false, 'background-size: fill is invalid CSS');
assert.equal(index.includes('github.com/senli1073'), false, 'template should not hard-code the original author GitHub URL');
assert.equal(/<section[^>]+class="top-section"[^>]+style=/.test(index), false, 'hero background should not be defined with inline styles');
assert.match(config, /backgrounds:/, 'background images should be configured in config.yml');
assert.match(config, /static\/assets\/background\//, 'configured backgrounds should use the background directory');
const configuredBackgrounds = [...config.matchAll(/^\s+-\s+(static\/assets\/background\/\S+)$/gm)].map((match) => match[1]);
assert.ok(configuredBackgrounds.length > 0, 'at least one background image should be configured');
configuredBackgrounds.forEach((background) => {
  assert.equal(fs.existsSync(path.join(root, background)), true, `configured background should exist: ${background}`);
});
assert.match(scripts, /function\s+initBackgroundSlideshow/, 'background slideshow should be initialized from JS');
assert.match(mainCss, /prefers-reduced-motion:\s*reduce/, 'slideshow should respect reduced motion preferences');
assert.equal(/<img\b[^>]*\bsrc="static\/assets\/img\/photo\.png"[^>]*\bwidth=/.test(index), false, 'avatar image should not force a fixed width attribute');
assert.equal(/<img\b[^>]*\bsrc="static\/assets\/img\/photo\.png"[^>]*\bheight=/.test(index), false, 'avatar image should not force a fixed height attribute');
assert.match(mainCss, /#avatar img[\s\S]*height:\s*auto/, 'avatar CSS should preserve the original image ratio');
assert.match(mainCss, /#avatar img[\s\S]*width:\s*min\(180px,\s*max\(130px,\s*calc\(100vw \/ 6\)\)\)/, 'avatar should keep responsive sizing with a smaller desktop maximum');
assert.match(mainCss, /\.top-section[\s\S]*height:\s*25rem/, 'hero should keep its full original height');
assert.match(gitignore, /^\.superpowers\/$/m, '.superpowers companion artifacts should be ignored');
assert.equal(/getElementById\(key\)\.innerHTML\s*=\s*yml\[key\]/.test(scripts), false, 'YAML config values should not be injected with innerHTML');
assert.match(scripts, /typesetPromise/, 'MathJax should be invoked with typesetPromise');
assert.equal(/MathJax\.typeset\(\)/.test(scripts), false, 'MathJax.typeset() should not be called repeatedly per section');
assert.equal(/const\s+section_names\s*=/.test(scripts), false, 'section list should come from configuration instead of a JS constant');
assert.equal(/^nav:\s*$/m.test(config), false, 'navigation should be derived from sections instead of a separate nav list');
assert.match(config, /sections:\n\s+-\s+id:\s+home/, 'sections should use object entries with ids');
assert.equal(/sections:\n(?:\s+-\s+\w+\n?)+$/m.test(config), false, 'sections should not be a plain string list');
assert.equal(/<ul class="navbar-nav ms-auto me-4 my-3 my-lg-0">\s*<li/s.test(index), false, 'navigation items should be rendered from configuration');
assert.match(index, /<main id="sections"><\/main>/, 'content sections should be rendered into a single sections container');
assert.equal(/<section[^>]+id="home"/.test(index), false, 'home section should not be hard-coded in index.html');
assert.equal(/<section[^>]+id="publications"/.test(index), false, 'publications section should not be hard-coded in index.html');
assert.equal(/<section[^>]+id="awards"/.test(index), false, 'awards section should not be hard-coded in index.html');
assert.match(config, /sections:\n\s+-\s+id:\s+home[\s\S]*title:/, 'section entries should define display titles');
assert.match(config, /id:\s+publications[\s\S]*icon:\s+bi-file-text-fill/, 'section icon should be configured as a Bootstrap Icons class');
assert.match(config, /id:\s+awards[\s\S]*icon:\s+bi-award-fill/, 'award icon should be configured as a Bootstrap Icons class');
assert.match(scripts, /function\s+renderSections/, 'sections should be generated from configuration');
assert.match(scripts, /bg-gradient-primary-to-secondary-light/, 'generated sections should include light background styling');
assert.match(scripts, /bg-gradient-primary-to-secondary-gray/, 'generated sections should include gray background styling');
assert.equal(/['"]mt-5['"]/.test(scripts), false, 'generated sections should not add extra top margins');
assert.equal(/['"]mb-5['"]/.test(scripts), false, 'generated sections should not add extra bottom margins');
assert.match(index, /<body[^>]*class="site-loading"/, 'page should start in a loading state before async content is ready');
assert.match(index, /id="page-skeleton"/, 'page should include skeleton placeholders for initial async loading');
assert.match(mainCss, /@keyframes\s+skeleton-shimmer/, 'skeleton placeholders should use a shimmer animation');
assert.match(mainCss, /animation:\s*skeleton-shimmer/, 'skeleton placeholders should show a moving shimmer while loading');
assert.match(mainCss, /prefers-reduced-motion:\s*reduce[\s\S]*\.skeleton-block/, 'skeleton animation should respect reduced motion preferences');
assert.match(scripts, /function\s+markSiteReady/, 'JS should expose a loading completion transition');
assert.match(scripts, /\.finally\(\(\)\s*=>\s*markSiteReady\(\)\)/, 'site should leave loading state even if content loading fails');
assert.doesNotMatch(index, /skeleton-nav/, 'navbar should not use skeleton placeholders');
assert.doesNotMatch(index, /skeleton-hero/, 'hero text should not use skeleton placeholder markup');
assert.doesNotMatch(index, /skeleton-avatar/, 'avatar should not use skeleton placeholders');
assert.doesNotMatch(mainCss, /\.skeleton-nav\b/, 'navbar skeleton CSS should not be kept');
assert.doesNotMatch(mainCss, /\.skeleton-hero\b/, 'hero text skeleton CSS should not be kept');
assert.doesNotMatch(mainCss, /\.skeleton-avatar\b/, 'avatar skeleton CSS should not be kept');
assert.match(mainCss, /\.page-skeleton\s*\{[\s\S]*top:\s*25rem/, 'section skeleton should start below the real hero area');
assert.match(mainCss, /\.page-skeleton\s*\{[\s\S]*padding-top:\s*2\.4rem/, 'section skeleton placeholders should sit one text line lower');
assert.match(mainCss, /\.site-loading \.top-section\s*\{[\s\S]*linear-gradient/, 'hero background should keep a loading placeholder');
assert.match(mainCss, /\.site-loading \.top-section::after\s*\{[\s\S]*animation:\s*skeleton-shimmer/, 'hero background placeholder should shimmer while loading');
assert.match(index, /id="page-top-title"[^>]*>\s*&nbsp;\s*<\/a>/, 'navbar brand should reserve initial height before config loads');
assert.match(mainCss, /\.page-skeleton\s*\{[\s\S]*z-index:\s*8000/, 'section skeleton should stay below the avatar layer');
assert.match(mainCss, /#avatar\s*\{[\s\S]*z-index:\s*9000/, 'avatar should stay above the section skeleton while loading');
assert.match(mainCss, /\.skeleton-block\s*\{[\s\S]*max-width:\s*100%/, 'skeleton blocks should never overflow their container');
assert.match(mainCss, /\.skeleton-line-long\s*\{[\s\S]*width:\s*100%/, 'long skeleton lines should shrink with the content container');
assert.match(mainCss, /\.skeleton-line-short\s*\{[\s\S]*width:\s*68%/, 'short skeleton lines should use proportional width for narrow screens');

console.log('template quality checks passed');
