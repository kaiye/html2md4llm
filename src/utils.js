const htmlEntities = {
  '&nbsp;': ' ',
  '&lt;': '<',
  '&gt;': '>',
  '&amp;': '&',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'"
};

export function decodeEntity(entity) {
  if (entity.startsWith('&#x')) {
    return String.fromCharCode(parseInt(entity.slice(3, -1), 16));
  }
  if (entity.startsWith('&#')) {
    return String.fromCharCode(parseInt(entity.slice(2, -1), 10));
  }
  return htmlEntities[entity] || entity;
}

export function decodeEntities(text) {
  return text.replace(/&[#\w]+;/g, decodeEntity);
}

export function createElement(tag, attributes = {}, children = []) {
  return { type: 'element', tag, attributes, children, parent: null };
}

function cleanText(text) {
  return text.replace(/[\u200E\u200F\u202A-\u202E]/g, '');
}

export function createText(text) {
  return { type: 'text', text: cleanText(text), parent: null };
}
