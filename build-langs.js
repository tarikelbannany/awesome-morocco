// Generates /en/, /fr/, /ar/ index.html from the root index.html (single source of truth).
// Each page gets translated <title>, meta description, Open Graph / Twitter tags,
// og:locale, per-language preview image, canonical, and a baked window.SITE_LANG so the
// app + social scrapers show the right language. Run:  node build-langs.js
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const BASE = 'https://tarikelbannany.github.io/awesome-morocco/';

const LANGS = {
  en: {
    dir: 'ltr', ogLocale: 'en_US',
    title: 'Awesome Morocco — Explore 160+ Moroccan Government Digital Services | Taxes, Identity, Health, Education & More',
    desc: "Discover and access 160+ Moroccan government digital services organized across 33 categories. From Idarati and SIMPL tax portal to Massar education, CNSS social security, Watiqa civil documents, ANAPEC employment, and more. Your one-stop guide to Morocco's e-government ecosystem. Available in English, French, and Arabic.",
    ogTitle: 'Awesome Morocco — 160+ Moroccan Government Digital Services',
    ogDesc: "Your one-stop guide to Morocco's e-government ecosystem. Discover 160+ digital services across 33 categories — taxes, identity, health, education, business, transport and more. Available in English, French, and Arabic.",
    imgAlt: 'Awesome Morocco — Directory of 160+ Moroccan Government Digital Services',
  },
  fr: {
    dir: 'ltr', ogLocale: 'fr_FR',
    title: "Awesome Morocco — Explorez 160+ services numériques du gouvernement marocain | Impôts, Identité, Santé, Éducation & plus",
    desc: "Découvrez et accédez à 160+ services numériques du gouvernement marocain, répartis en 33 catégories : Idarati, SIMPL, Massar, CNSS, Watiqa, ANAPEC et plus. Votre guide de l'écosystème e-gouvernement du Maroc. Disponible en anglais, français et arabe.",
    ogTitle: "Awesome Morocco — 160+ services numériques du gouvernement marocain",
    ogDesc: "Votre guide de l'écosystème e-gouvernement marocain. 160+ services numériques dans 33 catégories — impôts, identité, santé, éducation, entreprises, transport et plus. En anglais, français et arabe.",
    imgAlt: "Awesome Morocco — Annuaire de 160+ services numériques du gouvernement marocain",
  },
  ar: {
    dir: 'rtl', ogLocale: 'ar_MA',
    title: "أوسم المغرب — اكتشف أكثر من 160 خدمة رقمية حكومية مغربية | الضرائب، الهوية، الصحة، التعليم والمزيد",
    desc: "اكتشف وادخل إلى أكثر من 160 خدمة رقمية حكومية مغربية موزعة على 33 فئة: إدارتي، SIMPL، مسار، CNSS، وثيقة، أنابيك والمزيد. دليلك لمنظومة الحكومة الإلكترونية بالمغرب. متوفر بالإنجليزية والفرنسية والعربية.",
    ogTitle: "أوسم المغرب — أكثر من 160 خدمة رقمية حكومية مغربية",
    ogDesc: "دليلك لمنظومة الحكومة الإلكترونية المغربية. أكثر من 160 خدمة رقمية عبر 33 فئة — الضرائب، الهوية، الصحة، التعليم، الأعمال، النقل والمزيد.",
    imgAlt: "أوسم المغرب — دليل أكثر من 160 خدمة رقمية حكومية مغربية",
  },
};

const src = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');

const setName = (h, name, val) =>
  h.replace(new RegExp('(<meta name="' + name + '" content=")[^"]*(">)'), (_, a, b) => a + val + b);
const setProp = (h, prop, val) =>
  h.replace(new RegExp('(<meta property="' + prop.replace(/:/g, '\\:') + '" content=")[^"]*(">)'), (_, a, b) => a + val + b);

for (const [code, L] of Object.entries(LANGS)) {
  const url = BASE + code + '/';
  const img = BASE + 'og-image-' + code + '.png';
  let h = src;

  // <html lang/dir>
  h = h.replace(/<html lang="[^"]*" dir="[^"]*">/, `<html lang="${code}" dir="${L.dir}">`);
  // bake language for the app (and as an explicit signal)
  h = h.replace(/<head>/, `<head>\n<script>window.SITE_LANG="${code}";</script>`);
  // title + description
  h = h.replace(/<title>[^<]*<\/title>/, `<title>${L.title}</title>`);
  h = setName(h, 'description', L.desc);
  // canonical + urls
  h = h.replace(/(<link rel="canonical" href=")[^"]*(">)/, (_, a, b) => a + url + b);
  h = setProp(h, 'og:url', url);
  h = setName(h, 'twitter:url', url);
  // Open Graph
  h = setProp(h, 'og:title', L.ogTitle);
  h = setProp(h, 'og:description', L.ogDesc);
  h = setProp(h, 'og:locale', L.ogLocale);
  h = setProp(h, 'og:image', img);
  h = setProp(h, 'og:image:secure_url', img);
  h = setProp(h, 'og:image:alt', L.imgAlt);
  // Twitter
  h = setName(h, 'twitter:title', L.ogTitle);
  h = setName(h, 'twitter:description', L.ogDesc);
  h = setName(h, 'twitter:image', img);
  h = setName(h, 'twitter:image:alt', L.imgAlt);

  const dir = path.join(ROOT, code);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), h);
  console.log('built', code + '/index.html');
}
console.log('Done. Root index.html is the English default (edit it, then re-run this script).');
