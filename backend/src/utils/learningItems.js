const normalizeSourceText = sourceText => {
    return String(sourceText || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
};

module.exports = {
    normalizeSourceText
};
