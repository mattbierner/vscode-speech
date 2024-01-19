import * as say from 'say';
import * as vscode from 'vscode';

const getVoice = (): string | undefined =>
    vscode.workspace.getConfiguration('speech').get<string>('voice');

const getSpeed = (): number | undefined =>
    vscode.workspace.getConfiguration('speech').get<number>('speed');

const getSubstitutions = (): { [key: string]: string } =>
    vscode.workspace.getConfiguration('speech').get<{ [key: string]: string }>('substitutions') || {};


const stopSpeaking = () => {
    say.stop();
}

const cleanText = (text: string): string => {
    text = text.trim();
    for (let [pattern, replacement] of Object.entries(getSubstitutions())) {
        text = text.replaceAll(pattern, replacement);
    }
    return text;
}

const speakText = (text: string) => {
    text = cleanText(text);
    if (text.length > 0) {
        say.speak(text, getVoice(), getSpeed());
    }
};

const speakCurrentSelection = (editor: vscode.TextEditor) => {
    const selection = editor.selection;
    if (!selection)
        return;

    speakText(editor.document.getText(selection));
};

const speakDocument = (editor: vscode.TextEditor) => {
    speakText(editor.document.getText());
};


export function activate(context: vscode.ExtensionContext) {
    context.subscriptions.push(vscode.commands.registerTextEditorCommand('speech.speakDocument', (editor) => {
        stopSpeaking();
        if (!editor)
            return;
        speakDocument(editor);
    }));

    context.subscriptions.push(vscode.commands.registerTextEditorCommand('speech.speakSelection', (editor) => {
        stopSpeaking();
        if (!editor)
            return;
        speakCurrentSelection(editor);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('speech.stopSpeaking', () => {
        stopSpeaking();
    }));
}
