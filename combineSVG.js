const fs = require('fs-extra');
const path = require('path');

// Function to extract the inner content and attributes of an SVG
const extractSVGDetails = (svgContent) => {
  const svgMatch = svgContent.match(/<svg[^>]*>/);
  const innerContentMatch = svgContent.match(/<svg[^>]*>([\s\S]*?)<\/svg>/);
  
  const attributes = {};
  if (svgMatch) {
    const attrString = svgMatch[0].replace('<svg', '').replace('>', '');
    attrString.split(/\s+/).forEach(attr => {
      const [name, value] = attr.split('=');
      if (name && value) {
        attributes[name] = value.replace(/"/g, '');
      }
    });
  }

  return {
    innerContent: innerContentMatch ? innerContentMatch[1] : '',
    attributes: attributes
  };
};

// Function to combine SVG files
const combineSVGFiles = async (inputFiles, outputFile) => {
  let combinedContent = '<svg xmlns="http://www.w3.org/2000/svg"';

  const firstSVGPath = path.join(__dirname, inputFiles[0]);
  const firstSVGContent = await fs.readFile(firstSVGPath, 'utf8');
  const firstSVGDetails = extractSVGDetails(firstSVGContent);

  // Set the width and height of the combined SVG based on the first SVG
  const { width, height } = firstSVGDetails.attributes;
  if (width) combinedContent += ` width="${width}"`;
  if (height) combinedContent += ` height="${height}"`;

  combinedContent += '>';

  for (let i = 0; i < inputFiles.length; i++) {
    const filePath = path.join(__dirname, inputFiles[i]);
    const svgContent = await fs.readFile(filePath, 'utf8');
    let { innerContent } = extractSVGDetails(svgContent);

    if (i === 1) { // Apply opacity to the second SVG file
      innerContent = `<g opacity="0.1">${innerContent}</g>`;
    }

    combinedContent += innerContent;
  }

  combinedContent += '</svg>';
  await fs.writeFile(outputFile, combinedContent, 'utf8');
  console.log(`Combined SVG saved to ${outputFile}`);
};

// Example usage
const inputFiles = ['svg1.svg', 'svg2.svg'];
const outputFile = path.join(__dirname, 'combined.svg');

combineSVGFiles(inputFiles, outputFile).catch(console.error);
