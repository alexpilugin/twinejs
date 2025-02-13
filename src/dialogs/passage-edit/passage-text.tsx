import * as React from 'react';
import {DialogEditor} from '../../components/container/dialog-card';
import {CodeArea} from '../../components/control/code-area';
import {usePrefsContext} from '../../store/prefs';
import {Passage} from '../../store/stories';
import {StoryFormat, useFormatCodeMirrorMode} from '../../store/story-formats';
import {StoryFormatToolbar} from './story-format-toolbar';

export interface PassageTextProps {
	onChange: (value: string) => void;
	onEditorChange: (value: CodeMirror.Editor) => void;
	passage: Passage;
	storyFormat: StoryFormat;
}

export const PassageText: React.FC<PassageTextProps> = props => {
	const {onChange, onEditorChange, passage, storyFormat} = props;
	const [editor, setEditor] = React.useState<CodeMirror.Editor>();
	const {prefs} = usePrefsContext();
	const mode =
		useFormatCodeMirrorMode(storyFormat.name, storyFormat.version) ?? 'text';

	function handleMount(editor: CodeMirror.Editor) {
		setEditor(editor);
		onEditorChange(editor);

		// The potential combination of loading a mode and the dialog entrance
		// animation seems to mess up CodeMirror's cursor rendering. The delay below
		// is intended to run after the animation completes.

		window.setTimeout(() => {
			editor.focus();
			editor.refresh();
		}, 400);
	}

	function handleChange(
		editor: CodeMirror.Editor,
		data: CodeMirror.EditorChange,
		text: string
	) {
		onEditorChange(editor);
		onChange(text);
	}

	return (
		<>
			<StoryFormatToolbar editor={editor} storyFormat={storyFormat} />
			<DialogEditor>
				<CodeArea
					editorDidMount={handleMount}
					fontFamily={prefs.passageEditorFontFamily}
					fontScale={prefs.passageEditorFontScale}
					onBeforeChange={handleChange}
					onChange={onEditorChange}
					options={{mode, lineWrapping: true}}
					value={passage.text}
				/>
			</DialogEditor>
		</>
	);
};
