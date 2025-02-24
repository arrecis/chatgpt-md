import { App, Editor, Notice, SuggestModal } from "obsidian";
import { EditorService } from "../Services/EditorService";

export class AiModelSuggestModal extends SuggestModal<string> {
  private modelNames: string[];
  private editor: Editor;
  private editorService: EditorService;

  constructor(app: App, editor: Editor, editorService: EditorService, modelNames: string[] = []) {
    super(app);
    this.modelNames = modelNames;
    this.editor = editor;
    this.editorService = editorService;
    if (this.modelNames.length > 0) {
      this.setPlaceholder("Select Large Language Model");
    } else {
      this.setPlaceholder("Loading available models...");
    }
  }

  getSuggestions(query: string): string[] {
    return this.modelNames.filter((model) => model.toLowerCase().includes(query.toLowerCase()));
  }

  renderSuggestion(model: string, el: HTMLElement) {
    el.createEl("div", { text: model });
  }

  onChooseSuggestion(modelName: string, evt: MouseEvent | KeyboardEvent) {
    if (this.modelNames.indexOf(modelName) === -1 || this.modelNames.length === 0) {
      return;
    }

    new Notice(`Selected model: ${modelName}`);
    this.editorService.setModel(this.editor, modelName);
  }
}
