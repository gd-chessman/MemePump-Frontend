declare module 'translate' {
    interface TranslateOptions {
      from?: string;
      to: string;
    }
    
    function translate(text: string, options: TranslateOptions): Promise<string>;
    export default translate;
  } 