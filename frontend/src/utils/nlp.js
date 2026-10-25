// Utility to parse English/Tamil voice transcripts into item quantities

const tamilNumbers = {
    'ஒன்று': 1, 'ஒன்னு': 1, 'ஒரு': 1, 'one': 1,
    'இரண்டு': 2, 'ரெண்டு': 2, 'two': 2,
    'மூன்று': 3, 'மூணு': 3, 'three': 3,
    'நான்கு': 4, 'நாலு': 4, 'four': 4,
    'ஐந்து': 5, 'அஞ்சு': 5, 'five': 5,
    'ஆறு': 6, 'six': 6,
    'ஏழு': 7, 'seven': 7,
    'எட்டு': 8, 'eight': 8,
    'ஒன்பது': 9, 'nine': 9,
    'பத்து': 10, 'ten': 10,
};

const numberWords = Object.keys(tamilNumbers);

/**
 * Basic NLP parser to extract quantities and product names from text.
 * @param {string} transcript - The spoken text (e.g., "ரெண்டு சோப்பு and one rice")
 * @param {Array} productsList - List of products from DB to match against
 * @returns {Array} - Array of matched items: [{ productId, name, qty, price }]
 */
export const parseVoiceCommand = (transcript, productsList) => {
    if (!transcript) return [];
    
    let words = transcript.toLowerCase().split(/\s+/);
    let matchedItems = [];
    
    // Fuzzy search for products in the transcript
    for (let i = 0; i < words.length; i++) {
        let currentWord = words[i];
        let qty = 1; // Default quantity
        
        // Check if the previous word or current word is a number
        let possibleNumWord = i > 0 ? words[i-1] : null;
        
        if (possibleNumWord && tamilNumbers[possibleNumWord]) {
            qty = tamilNumbers[possibleNumWord];
        } else if (!isNaN(parseInt(possibleNumWord))) {
            qty = parseInt(possibleNumWord);
        } else if (tamilNumbers[currentWord]) {
            // If the current word is a number, we might be looking at "2 rice" instead of "rice 2"
            qty = tamilNumbers[currentWord];
            if (i < words.length - 1) {
                // Peek next word for product
                currentWord = words[i+1];
                i++; // Skip next word in main loop
            } else {
                continue;
            }
        } else if (!isNaN(parseInt(currentWord))) {
            qty = parseInt(currentWord);
             if (i < words.length - 1) {
                currentWord = words[i+1];
                i++; 
            } else {
                continue;
            }
        }

        // Try to match currentWord against product catalog
        let matchedProduct = productsList.find(p => 
            p.name.toLowerCase().includes(currentWord) || 
            currentWord.includes(p.name.toLowerCase())
        );

        if (matchedProduct) {
            // Check if we already added this product in this parse run
            let existing = matchedItems.find(item => item.productId === matchedProduct.id);
            if (existing) {
                existing.qty += qty;
            } else {
                matchedItems.push({
                    productId: matchedProduct.id,
                    name: matchedProduct.name,
                    price: matchedProduct.price,
                    qty: qty
                });
            }
        }
    }
    
    return matchedItems;
};
