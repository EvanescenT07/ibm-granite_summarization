declare module "pptx-parser" {
  /**
   * Extracts text from a PPTX file.
   * @param pathOrBuffer The path to the .pptx file or a Buffer containing the file data.
   * @returns A promise that resolves with the extracted text as a string.
   */
  export function slidesToText(pathOrBuffer: string | Buffer): Promise<string>;
}
