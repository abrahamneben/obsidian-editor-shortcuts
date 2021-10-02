import { Plugin } from 'obsidian';
import {
  insertLineAbove,
  insertLineBelow,
  deleteSelectedLines,
  joinLines,
  duplicateLine,
  selectLine,
  transformCase,
  goToLineBoundary,
} from './actions';
import { CASE } from './constants';

export default class CodeEditorShortcuts extends Plugin {
  onload() {
    this.addCommand({
      id: 'insertLineAbove',
      name: 'Insert line above',
      hotkeys: [
        {
          modifiers: ['Mod', 'Shift'],
          key: 'Enter',
        },
      ],
      editorCallback: (editor) => insertLineAbove(editor),
    });

    this.addCommand({
      id: 'insertLineBelow',
      name: 'Insert line below',
      hotkeys: [
        {
          modifiers: ['Mod'],
          key: 'Enter',
        },
      ],
      editorCallback: (editor) => insertLineBelow(editor),
    });

    this.addCommand({
      id: 'deleteLine',
      name: 'Delete line',
      hotkeys: [
        {
          modifiers: ['Mod', 'Shift'],
          key: 'K',
        },
        {
          modifiers: ['Ctrl', 'Shift'],
          key: 'K',
        },
      ],
      editorCallback: (editor) => deleteSelectedLines(editor),
    });

    this.addCommand({
      id: 'joinLines',
      name: 'Join lines',
      hotkeys: [
        {
          modifiers: ['Mod'],
          key: 'J',
        },
      ],
      editorCallback: (editor) => joinLines(editor),
    });

    this.addCommand({
      id: 'duplicateLine',
      name: 'Duplicate line',
      hotkeys: [
        {
          modifiers: ['Mod', 'Shift'],
          key: 'D',
        },
      ],
      editorCallback: (editor) => duplicateLine(editor),
    });

    this.addCommand({
      id: 'selectLine',
      name: 'Select line',
      hotkeys: [
        {
          modifiers: ['Mod'],
          key: 'L',
        },
      ],
      editorCallback: (editor) => selectLine(editor),
    });

    this.addCommand({
      id: 'goToLineStart',
      name: 'Go to start of line',
      editorCallback: (editor) => goToLineBoundary(editor, 'start'),
    });

    this.addCommand({
      id: 'goToLineEnd',
      name: 'Go to end of line',
      editorCallback: (editor) => goToLineBoundary(editor, 'end'),
    });

    this.addCommand({
      id: 'transformToUppercase',
      name: 'Transform selection to uppercase',
      editorCallback: (editor) => transformCase(editor, CASE.UPPER),
    });

    this.addCommand({
      id: 'transformToLowercase',
      name: 'Transform selection to lowercase',
      editorCallback: (editor) => transformCase(editor, CASE.LOWER),
    });

    this.addCommand({
      id: 'transformToTitlecase',
      name: 'Transform selection to title case',
      editorCallback: (editor) => transformCase(editor, CASE.TITLE),
    });
  }
}
