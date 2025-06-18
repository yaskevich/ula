
const serializeSVG = (svg: HTMLElement | SVGElement) => {
    const xmlns = 'http://www.w3.org/2000/xmlns/';
    const xlinkns = 'http://www.w3.org/1999/xlink';
    const svgns = 'http://www.w3.org/2000/svg';
    return function serialize() {
        // console.log("svg source", svg);
        (svg as Node) = svg.cloneNode(true);
        const fragment = window.location.href + '#';
        const walker = document.createTreeWalker(svg, NodeFilter.SHOW_ELEMENT);
        while (walker.nextNode()) {
            for (const attr of (walker.currentNode as Element).attributes) {
                if (attr.value.includes(fragment)) {
                    attr.value = attr.value.replace(fragment, '#');
                }
            }
        }
        svg.setAttributeNS(xmlns, 'xmlns', svgns);
        svg.setAttributeNS(xmlns, 'xmlns:xlink', xlinkns);
        // const { width, height } = resizeState.dimensions;
        const width = 600, height = 400;

        svg.setAttribute('viewBox', `-10 -10 ${width + 20} ${height + 40}`);
        const serializer = new window.XMLSerializer();
        const string = serializer.serializeToString(svg);
        return new Blob([string], { type: 'image/svg+xml' });
    };
};


const renderImage = (svg: HTMLElement) => {
    let resolve, reject = null;
    const promise = new Promise((y, n) => ((resolve = y), (reject = n)));
    const image = new Image();
    image.onerror = reject;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const link = document.createElement('a');
    // const filename = tkn + '-' + store.getFormattedTime();
    const filename = "test.png";

    image.onload = () => {
        const rect = svg.getBoundingClientRect();
        canvas.width = rect.width * 4;
        canvas.height = rect.height * 4;
        if (context) {
            context.fillStyle = '#F1F1EF';
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, rect.width * 4, rect.height * 4);

            context.canvas.toBlob(function (blob) {
                if (blob) {
                    var url = URL.createObjectURL(blob);
                    link.download = filename + '.png';
                    link.href = url;
                    link.click();
                    URL.revokeObjectURL(url);
                }
            });
        }
        // console.log('on load');
    };

    const serializedSVG = serializeSVG(svg);
    // console.log("svg:serialized", serializedSVG());
    const url = URL.createObjectURL(serializedSVG());
    link.download = filename + '.svg';
    image.src = url;
    link.href = url;
    // link.click();
    return promise;
};

const getFontBase64 = async (svg: any) => {
    let newStyle = "";

    const blobToBase64 = (blob: Blob) => {
        return new Promise((resolve, _) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    };

    for (const sheet of document.styleSheets) {
        for (const rule of sheet.cssRules) {
            if (rule.constructor.name === 'CSSFontFaceRule') {
                const styleRule = (rule as CSSStyleRule).style;
                const srcString = styleRule.getPropertyValue("src");
                if (!srcString.includes('primeicons')) {
                    const src = srcString.split("(")[1].split(")")[0].replace(/"|'/g, "");
                    const blob = await (await fetch(src)).blob();
                    const base64 = await blobToBase64(blob);
                    newStyle += `@font-face {`;
                    for (const style of styleRule) {
                        const propValue = style !== "src" ? styleRule.getPropertyValue(style) : `url("${base64}")`;
                        newStyle += `${style}: ${propValue};`;
                    }
                    newStyle += `}`;
                }
            }
        }
    }

    if (newStyle) {
        svg.append('defs').append('style').attr('type', 'text/css').text(newStyle);
    }
};


export default {
    renderImage,
    getFontBase64
};