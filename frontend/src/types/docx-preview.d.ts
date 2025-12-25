declare module 'docx-preview' {
    export interface Options {
        className?: string;
        inWrapper?: boolean;
        ignoreWidth?: boolean;
        ignoreHeight?: boolean;
        ignoreFonts?: boolean;
        breakPages?: boolean;
        ignoreLastRenderedPageBreak?: boolean;
        experimental?: boolean;
        trimXmlDeclaration?: boolean;
        useBase64URL?: boolean;
    }

    export function renderAsync(
        data: Blob | ArrayBuffer | Uint8Array,
        bodyContainer: HTMLElement,
        styleContainer?: HTMLElement | null | undefined,
        options?: Partial<Options>
    ): Promise<void>;
}

