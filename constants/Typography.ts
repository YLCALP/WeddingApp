const fontFamily = {
    // Serif font for Titles (Elegant)
    serif: 'PlayfairDisplay-SemiBold',
    serifRegular: 'PlayfairDisplay-Regular',

    // Sans-serif for Body text (Clean/Readable) - REMOVED (Migrated to Serif)
    // sans: 'Lato-Regular', 
    // sansBold: 'Lato-Bold',

    // Monospace for IDs/Codes
    mono: 'SpaceMono',

    // Cursive for accents/names (Decorative)
    cursive: 'GreatVibes-Regular',
};

export const Typography = {
    fontFamily,
    // Pre-defined styles mixing size, weight, and family
    styles: {
        displayTitle: {
            fontFamily: fontFamily.serif,
            fontSize: 32,
        },
        title1: {
            fontFamily: fontFamily.serif,
            fontSize: 24,
        },
        title2: {
            fontFamily: fontFamily.serif,
            fontSize: 20,
        },
        body: {
            fontFamily: fontFamily.serifRegular,
            fontSize: 16,
        },
        button: {
            fontFamily: fontFamily.serif, // Changed from sansBold
            fontSize: 16,
        },
        cursiveTitle: {
            fontFamily: fontFamily.cursive,
            fontSize: 36,
        },
    },
};
