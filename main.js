var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/main.ts
__export(exports, {
  default: () => CodeEditorShortcuts
});
var import_obsidian3 = __toModule(require("obsidian"));

// src/constants.ts
var CASE;
(function(CASE2) {
  CASE2["UPPER"] = "upper";
  CASE2["LOWER"] = "lower";
  CASE2["TITLE"] = "title";
  CASE2["NEXT"] = "next";
})(CASE || (CASE = {}));
var LOWERCASE_ARTICLES = ["the", "a", "an"];
var SEARCH_DIRECTION;
(function(SEARCH_DIRECTION2) {
  SEARCH_DIRECTION2["FORWARD"] = "forward";
  SEARCH_DIRECTION2["BACKWARD"] = "backward";
})(SEARCH_DIRECTION || (SEARCH_DIRECTION = {}));
var MATCHING_BRACKETS = {
  "[": "]",
  "(": ")",
  "{": "}"
};
var MATCHING_QUOTES = {
  "'": "'",
  '"': '"',
  "`": "`"
};
var MATCHING_QUOTES_BRACKETS = __spreadValues(__spreadValues({}, MATCHING_QUOTES), MATCHING_BRACKETS);
var CODE_EDITOR;
(function(CODE_EDITOR2) {
  CODE_EDITOR2["SUBLIME"] = "sublime";
  CODE_EDITOR2["VSCODE"] = "vscode";
})(CODE_EDITOR || (CODE_EDITOR = {}));
var MODIFIER_KEYS = [
  "Control",
  "Shift",
  "Alt",
  "Meta",
  "CapsLock",
  "Fn"
];
var LIST_CHARACTER_REGEX = /^\s*(-|\+|\*|\d+\.|>) (\[.\] )?/;

// src/state.ts
var SettingsState = {
  autoInsertListPrefix: true
};

// src/utils.ts
var defaultMultipleSelectionOptions = { repeatSameLineActions: true };
var withMultipleSelectionsNew = (editor, callback, options = defaultMultipleSelectionOptions) => {
  const selections = editor.listSelections();
  let selectionIndexesToProcess;
  const newSelections = [];
  const changes = [];
  if (!options.repeatSameLineActions) {
    const seenLines = [];
    selectionIndexesToProcess = selections.reduce((indexes, currSelection, currIndex) => {
      const currentLine = currSelection.head.line;
      if (!seenLines.includes(currentLine)) {
        seenLines.push(currentLine);
        indexes.push(currIndex);
      }
      return indexes;
    }, []);
  }
  for (let i = 0; i < selections.length; i++) {
    if (selectionIndexesToProcess && !selectionIndexesToProcess.includes(i)) {
      continue;
    }
    const { changes: newChanges, newSelection } = callback(editor, selections[i], __spreadProps(__spreadValues({}, options.args), {
      iteration: i
    }));
    changes.push(...newChanges);
    if (options.combineSameLineSelections) {
      const existingSameLineSelection = newSelections.find((selection) => selection.from.line === newSelection.from.line);
      if (existingSameLineSelection) {
        existingSameLineSelection.from.ch = 0;
        continue;
      }
    }
    newSelections.push(newSelection);
  }
  editor.transaction({
    changes,
    selections: newSelections
  });
};
var withMultipleSelections = (editor, callback, options = defaultMultipleSelectionOptions) => {
  const { cm } = editor;
  const selections = editor.listSelections();
  let selectionIndexesToProcess;
  let newSelections = [];
  if (!options.repeatSameLineActions) {
    const seenLines = [];
    selectionIndexesToProcess = selections.reduce((indexes, currSelection, currIndex) => {
      const currentLine = currSelection.head.line;
      if (!seenLines.includes(currentLine)) {
        seenLines.push(currentLine);
        indexes.push(currIndex);
      }
      return indexes;
    }, []);
  }
  const applyCallbackOnSelections = () => {
    for (let i = 0; i < selections.length; i++) {
      if (selectionIndexesToProcess && !selectionIndexesToProcess.includes(i)) {
        continue;
      }
      const selection = editor.listSelections()[i];
      if (selection) {
        const newSelection = callback(editor, selection, options.args);
        newSelections.push(newSelection);
      }
    }
    if (options.customSelectionHandler) {
      newSelections = options.customSelectionHandler(newSelections);
    }
    editor.setSelections(newSelections);
  };
  if (cm && cm.operation) {
    cm.operation(applyCallbackOnSelections);
  } else {
    console.debug("cm object not found, operations will not be buffered");
    applyCallbackOnSelections();
  }
};
var iterateCodeMirrorDivs = (callback) => {
  let codeMirrors;
  codeMirrors = document.querySelectorAll(".cm-content");
  if (codeMirrors.length === 0) {
    codeMirrors = document.querySelectorAll(".CodeMirror");
  }
  codeMirrors.forEach(callback);
};
var getLineStartPos = (line) => ({
  line,
  ch: 0
});
var getLineEndPos = (line, editor) => ({
  line,
  ch: editor.getLine(line).length
});
var getSelectionBoundaries = (selection) => {
  let { anchor: from, head: to } = selection;
  if (from.line > to.line) {
    [from, to] = [to, from];
  }
  if (from.line === to.line && from.ch > to.ch) {
    [from, to] = [to, from];
  }
  return { from, to, hasTrailingNewline: to.line > from.line && to.ch === 0 };
};
var getLeadingWhitespace = (lineContent) => {
  const indentation = lineContent.match(/^\s+/);
  return indentation ? indentation[0] : "";
};
var isLetterCharacter = (char) => /\p{L}\p{M}*/u.test(char);
var isDigit = (char) => /\d/.test(char);
var isLetterOrDigit = (char) => isLetterCharacter(char) || isDigit(char);
var wordRangeAtPos = (pos, lineContent) => {
  let start = pos.ch;
  let end = pos.ch;
  while (start > 0 && isLetterOrDigit(lineContent.charAt(start - 1))) {
    start--;
  }
  while (end < lineContent.length && isLetterOrDigit(lineContent.charAt(end))) {
    end++;
  }
  return {
    anchor: {
      line: pos.line,
      ch: start
    },
    head: {
      line: pos.line,
      ch: end
    }
  };
};
var findPosOfNextCharacter = ({
  editor,
  startPos,
  checkCharacter,
  searchDirection
}) => {
  let { line, ch } = startPos;
  let lineContent = editor.getLine(line);
  let matchFound = false;
  let matchedChar;
  if (searchDirection === SEARCH_DIRECTION.BACKWARD) {
    while (line >= 0) {
      const char = lineContent.charAt(Math.max(ch - 1, 0));
      matchFound = checkCharacter(char);
      if (matchFound) {
        matchedChar = char;
        break;
      }
      ch--;
      if (ch <= 0) {
        line--;
        if (line >= 0) {
          lineContent = editor.getLine(line);
          ch = lineContent.length;
        }
      }
    }
  } else {
    while (line < editor.lineCount()) {
      const char = lineContent.charAt(ch);
      matchFound = checkCharacter(char);
      if (matchFound) {
        matchedChar = char;
        break;
      }
      ch++;
      if (ch >= lineContent.length) {
        line++;
        lineContent = editor.getLine(line);
        ch = 0;
      }
    }
  }
  return matchFound ? {
    match: matchedChar,
    pos: {
      line,
      ch
    }
  } : null;
};
var hasSameSelectionContent = (editor, selections) => new Set(selections.map((selection) => {
  const { from, to } = getSelectionBoundaries(selection);
  return editor.getRange(from, to);
})).size === 1;
var getSearchText = ({
  editor,
  allSelections,
  autoExpand
}) => {
  const singleSearchText = hasSameSelectionContent(editor, allSelections);
  const firstSelection = allSelections[0];
  const { from, to } = getSelectionBoundaries(firstSelection);
  let searchText = editor.getRange(from, to);
  if (searchText.length === 0 && autoExpand) {
    const wordRange = wordRangeAtPos(from, editor.getLine(from.line));
    searchText = editor.getRange(wordRange.anchor, wordRange.head);
  }
  return {
    searchText,
    singleSearchText
  };
};
var escapeRegex = (input) => input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
var withWordBoundaries = (input) => `(?<=\\W|^)${input}(?=\\W|$)`;
var findAllMatches = ({
  searchText,
  searchWithinWords,
  documentContent
}) => {
  const escapedSearchText = escapeRegex(searchText);
  const searchExpression = new RegExp(searchWithinWords ? escapedSearchText : withWordBoundaries(escapedSearchText), "g");
  return Array.from(documentContent.matchAll(searchExpression));
};
var findNextMatchPosition = ({
  editor,
  latestMatchPos,
  searchText,
  searchWithinWords,
  documentContent
}) => {
  const latestMatchOffset = editor.posToOffset(latestMatchPos);
  const matches = findAllMatches({
    searchText,
    searchWithinWords,
    documentContent
  });
  let nextMatch = null;
  for (const match of matches) {
    if (match.index > latestMatchOffset) {
      nextMatch = {
        anchor: editor.offsetToPos(match.index),
        head: editor.offsetToPos(match.index + searchText.length)
      };
      break;
    }
  }
  if (!nextMatch) {
    const selectionIndexes = editor.listSelections().map((selection) => {
      const { from } = getSelectionBoundaries(selection);
      return editor.posToOffset(from);
    });
    for (const match of matches) {
      if (!selectionIndexes.includes(match.index)) {
        nextMatch = {
          anchor: editor.offsetToPos(match.index),
          head: editor.offsetToPos(match.index + searchText.length)
        };
        break;
      }
    }
  }
  return nextMatch;
};
var findAllMatchPositions = ({
  editor,
  searchText,
  searchWithinWords,
  documentContent
}) => {
  const matches = findAllMatches({
    searchText,
    searchWithinWords,
    documentContent
  });
  const matchPositions = [];
  for (const match of matches) {
    matchPositions.push({
      anchor: editor.offsetToPos(match.index),
      head: editor.offsetToPos(match.index + searchText.length)
    });
  }
  return matchPositions;
};
var toTitleCase = (selectedText) => {
  return selectedText.split(/(\s+)/).map((word, index, allWords) => {
    if (index > 0 && index < allWords.length - 1 && LOWERCASE_ARTICLES.includes(word.toLowerCase())) {
      return word.toLowerCase();
    }
    return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
  }).join("");
};
var getNextCase = (selectedText) => {
  const textUpper = selectedText.toUpperCase();
  const textLower = selectedText.toLowerCase();
  const textTitle = toTitleCase(selectedText);
  switch (selectedText) {
    case textUpper: {
      return textLower;
    }
    case textLower: {
      return textTitle;
    }
    case textTitle: {
      return textUpper;
    }
    default: {
      return textUpper;
    }
  }
};
var isNumeric = (input) => input.length > 0 && !isNaN(+input);
var getNextListPrefix = (text, direction) => {
  const listChars = text.match(LIST_CHARACTER_REGEX);
  if (listChars && listChars.length > 0) {
    let prefix = listChars[0].trimStart();
    const isEmptyListItem = prefix === listChars.input.trimStart();
    if (isEmptyListItem) {
      return null;
    }
    if (isNumeric(prefix) && direction === "after") {
      prefix = +prefix + 1 + ". ";
    }
    if (prefix.startsWith("- [") && !prefix.includes("[ ]")) {
      prefix = "- [ ] ";
    }
    return prefix;
  }
  return "";
};
var formatRemainingListPrefixes = (editor, fromLine, indentation) => {
  const changes = [];
  for (let i = fromLine; i < editor.lineCount(); i++) {
    const contentsOfCurrentLine = editor.getLine(i);
    const listPrefixRegex = new RegExp(`^${indentation}\\d+\\.`);
    const lineStartsWithNumberPrefix = listPrefixRegex.test(contentsOfCurrentLine);
    if (!lineStartsWithNumberPrefix) {
      break;
    }
    const replacementContent = contentsOfCurrentLine.replace(/\d+\./, (match) => +match + 1 + ".");
    changes.push({
      from: { line: i, ch: 0 },
      to: { line: i, ch: contentsOfCurrentLine.length },
      text: replacementContent
    });
  }
  if (changes.length > 0) {
    editor.transaction({ changes });
  }
};
var toggleVaultConfig = (app, setting) => {
  const value = app.vault.getConfig(setting);
  setVaultConfig(app, setting, !value);
};
var setVaultConfig = (app, setting, value) => {
  app.vault.setConfig(setting, value);
};

// src/actions.ts
var insertLineAbove = (editor, selection, args) => {
  const { line } = selection.head;
  const startOfCurrentLine = getLineStartPos(line);
  const contentsOfCurrentLine = editor.getLine(line);
  const indentation = getLeadingWhitespace(contentsOfCurrentLine);
  let listPrefix = "";
  if (SettingsState.autoInsertListPrefix && line > 0 && editor.getLine(line - 1).trim().length > 0) {
    listPrefix = getNextListPrefix(contentsOfCurrentLine, "before");
    if (isNumeric(listPrefix)) {
      formatRemainingListPrefixes(editor, line, indentation);
    }
  }
  const changes = [
    { from: startOfCurrentLine, text: indentation + listPrefix + "\n" }
  ];
  const newSelection = {
    from: __spreadProps(__spreadValues({}, startOfCurrentLine), {
      line: startOfCurrentLine.line + args.iteration,
      ch: indentation.length + listPrefix.length
    })
  };
  return {
    changes,
    newSelection
  };
};
var insertLineBelow = (editor, selection, args) => {
  const { line } = selection.head;
  const startOfCurrentLine = getLineStartPos(line);
  const endOfCurrentLine = getLineEndPos(line, editor);
  const contentsOfCurrentLine = editor.getLine(line);
  const indentation = getLeadingWhitespace(contentsOfCurrentLine);
  let listPrefix = "";
  if (SettingsState.autoInsertListPrefix) {
    listPrefix = getNextListPrefix(contentsOfCurrentLine, "after");
    if (listPrefix === null) {
      const changes2 = [
        { from: startOfCurrentLine, to: endOfCurrentLine, text: "" }
      ];
      const newSelection2 = {
        from: {
          line,
          ch: 0
        }
      };
      return {
        changes: changes2,
        newSelection: newSelection2
      };
    }
    if (isNumeric(listPrefix)) {
      formatRemainingListPrefixes(editor, line + 1, indentation);
    }
  }
  const changes = [
    { from: endOfCurrentLine, text: "\n" + indentation + listPrefix }
  ];
  const newSelection = {
    from: {
      line: line + 1 + args.iteration,
      ch: indentation.length + listPrefix.length
    }
  };
  return {
    changes,
    newSelection
  };
};
var numLinesDeleted = 0;
var deleteLine = (editor, selection, args) => {
  const { from, to, hasTrailingNewline } = getSelectionBoundaries(selection);
  if (to.line === editor.lastLine()) {
    const previousLine = Math.max(0, from.line - 1);
    const endOfPreviousLine = getLineEndPos(previousLine, editor);
    const changes2 = [
      {
        from: from.line === 0 ? getLineStartPos(0) : endOfPreviousLine,
        to: to.ch === 0 ? getLineStartPos(to.line) : getLineEndPos(to.line, editor),
        text: ""
      }
    ];
    const newSelection2 = {
      from: {
        line: previousLine,
        ch: Math.min(from.ch, endOfPreviousLine.ch)
      }
    };
    return {
      changes: changes2,
      newSelection: newSelection2
    };
  }
  if (args.iteration === 0) {
    numLinesDeleted = 0;
  }
  const toLine = hasTrailingNewline ? to.line - 1 : to.line;
  const endOfNextLine = getLineEndPos(toLine + 1, editor);
  const changes = [
    {
      from: getLineStartPos(from.line),
      to: getLineStartPos(toLine + 1),
      text: ""
    }
  ];
  const newSelection = {
    from: {
      line: from.line - numLinesDeleted,
      ch: Math.min(to.ch, endOfNextLine.ch)
    }
  };
  numLinesDeleted += toLine - from.line + 1;
  return {
    changes,
    newSelection
  };
};
var deleteToStartOfLine = (editor, selection) => {
  const pos = selection.head;
  let startPos = getLineStartPos(pos.line);
  if (pos.line === 0 && pos.ch === 0) {
    return selection;
  }
  if (pos.line === startPos.line && pos.ch === startPos.ch) {
    startPos = getLineEndPos(pos.line - 1, editor);
  }
  editor.replaceRange("", startPos, pos);
  return {
    anchor: startPos
  };
};
var deleteToEndOfLine = (editor, selection) => {
  const pos = selection.head;
  let endPos = getLineEndPos(pos.line, editor);
  if (pos.line === endPos.line && pos.ch === endPos.ch) {
    endPos = getLineStartPos(pos.line + 1);
  }
  editor.replaceRange("", pos, endPos);
  return {
    anchor: pos
  };
};
var joinLines = (editor, selection) => {
  var _a, _b;
  const { from, to } = getSelectionBoundaries(selection);
  const { line } = from;
  let endOfCurrentLine = getLineEndPos(line, editor);
  const joinRangeLimit = Math.max(to.line - line, 1);
  const selectionLength = editor.posToOffset(to) - editor.posToOffset(from);
  let trimmedChars = "";
  for (let i = 0; i < joinRangeLimit; i++) {
    if (line === editor.lineCount() - 1) {
      break;
    }
    endOfCurrentLine = getLineEndPos(line, editor);
    const endOfNextLine = getLineEndPos(line + 1, editor);
    const contentsOfCurrentLine = editor.getLine(line);
    const contentsOfNextLine = editor.getLine(line + 1);
    const charsToTrim = (_a = contentsOfNextLine.match(LIST_CHARACTER_REGEX)) != null ? _a : [];
    trimmedChars += (_b = charsToTrim[0]) != null ? _b : "";
    const newContentsOfNextLine = contentsOfNextLine.replace(LIST_CHARACTER_REGEX, "");
    if (newContentsOfNextLine.length > 0 && contentsOfCurrentLine.charAt(endOfCurrentLine.ch - 1) !== " ") {
      editor.replaceRange(" " + newContentsOfNextLine, endOfCurrentLine, endOfNextLine);
    } else {
      editor.replaceRange(newContentsOfNextLine, endOfCurrentLine, endOfNextLine);
    }
  }
  if (selectionLength === 0) {
    return {
      anchor: endOfCurrentLine
    };
  }
  return {
    anchor: from,
    head: {
      line: from.line,
      ch: from.ch + selectionLength - trimmedChars.length
    }
  };
};
var copyLine = (editor, selection, direction) => {
  const { from, to, hasTrailingNewline } = getSelectionBoundaries(selection);
  const fromLineStart = getLineStartPos(from.line);
  const toLine = hasTrailingNewline ? to.line - 1 : to.line;
  const toLineEnd = getLineEndPos(toLine, editor);
  const contentsOfSelectedLines = editor.getRange(fromLineStart, toLineEnd);
  if (direction === "up") {
    editor.replaceRange("\n" + contentsOfSelectedLines, toLineEnd);
    return selection;
  } else {
    editor.replaceRange(contentsOfSelectedLines + "\n", fromLineStart);
    const linesSelected = to.line - from.line + 1;
    return {
      anchor: { line: toLine + 1, ch: from.ch },
      head: { line: toLine + linesSelected, ch: to.ch }
    };
  }
};
var isManualSelection = true;
var setIsManualSelection = (value) => {
  isManualSelection = value;
};
var isProgrammaticSelectionChange = false;
var setIsProgrammaticSelectionChange = (value) => {
  isProgrammaticSelectionChange = value;
};
var selectWordOrNextOccurrence = (editor) => {
  setIsProgrammaticSelectionChange(true);
  const allSelections = editor.listSelections();
  const { searchText, singleSearchText } = getSearchText({
    editor,
    allSelections,
    autoExpand: false
  });
  if (searchText.length > 0 && singleSearchText) {
    const { from: latestMatchPos } = getSelectionBoundaries(allSelections[allSelections.length - 1]);
    const nextMatch = findNextMatchPosition({
      editor,
      latestMatchPos,
      searchText,
      searchWithinWords: isManualSelection,
      documentContent: editor.getValue()
    });
    const newSelections = nextMatch ? allSelections.concat(nextMatch) : allSelections;
    editor.setSelections(newSelections);
    const lastSelection = newSelections[newSelections.length - 1];
    editor.scrollIntoView(getSelectionBoundaries(lastSelection));
  } else {
    const newSelections = [];
    for (const selection of allSelections) {
      const { from, to } = getSelectionBoundaries(selection);
      if (from.line !== to.line || from.ch !== to.ch) {
        newSelections.push(selection);
      } else {
        newSelections.push(wordRangeAtPos(from, editor.getLine(from.line)));
        setIsManualSelection(false);
      }
    }
    editor.setSelections(newSelections);
  }
};
var selectAllOccurrences = (editor) => {
  const allSelections = editor.listSelections();
  const { searchText, singleSearchText } = getSearchText({
    editor,
    allSelections,
    autoExpand: true
  });
  if (!singleSearchText) {
    return;
  }
  const matches = findAllMatchPositions({
    editor,
    searchText,
    searchWithinWords: true,
    documentContent: editor.getValue()
  });
  editor.setSelections(matches);
};
var selectLine = (_editor, selection) => {
  const { from, to } = getSelectionBoundaries(selection);
  const startOfCurrentLine = getLineStartPos(from.line);
  const startOfNextLine = getLineStartPos(to.line + 1);
  return { anchor: startOfCurrentLine, head: startOfNextLine };
};
var select5LinesDown = (_editor, selection) => {
  const new_hd = { line: selection.head.line + 5, ch: selection.head.ch };
  return { anchor: selection.anchor, head: new_hd };
};
var select10LinesDown = (_editor, selection) => {
  const new_hd = { line: selection.head.line + 10, ch: selection.head.ch };
  return { anchor: selection.anchor, head: new_hd };
};
var select5LinesUp = (_editor, selection) => {
  const new_hd = { line: selection.head.line - 5, ch: selection.head.ch };
  return { anchor: selection.anchor, head: new_hd };
};
var select10LinesUp = (_editor, selection) => {
  const new_hd = { line: selection.head.line - 10, ch: selection.head.ch };
  return { anchor: selection.anchor, head: new_hd };
};
var addCursorsToSelectionEnds = (editor, emulate = CODE_EDITOR.VSCODE) => {
  if (editor.listSelections().length !== 1) {
    return;
  }
  const selection = editor.listSelections()[0];
  const { from, to, hasTrailingNewline } = getSelectionBoundaries(selection);
  const newSelections = [];
  const toLine = hasTrailingNewline ? to.line - 1 : to.line;
  for (let line = from.line; line <= toLine; line++) {
    const head = line === to.line ? to : getLineEndPos(line, editor);
    let anchor;
    if (emulate === CODE_EDITOR.VSCODE) {
      anchor = head;
    } else {
      anchor = line === from.line ? from : getLineStartPos(line);
    }
    newSelections.push({
      anchor,
      head
    });
  }
  editor.setSelections(newSelections);
};
var goToLineBoundary = (editor, selection, boundary) => {
  const { from, to } = getSelectionBoundaries(selection);
  if (boundary === "start") {
    return { anchor: getLineStartPos(from.line) };
  } else {
    return { anchor: getLineEndPos(to.line, editor) };
  }
};
var navigateLine = (editor, selection, position) => {
  const pos = selection.head;
  let line;
  let ch;
  if (position === "prev") {
    line = Math.max(pos.line - 1, 0);
    const endOfLine = getLineEndPos(line, editor);
    ch = Math.min(pos.ch, endOfLine.ch);
  }
  if (position === "next") {
    line = Math.min(pos.line + 1, editor.lineCount() - 1);
    const endOfLine = getLineEndPos(line, editor);
    ch = Math.min(pos.ch, endOfLine.ch);
  }
  if (position === "first") {
    line = 0;
    ch = 0;
  }
  if (position === "last") {
    line = editor.lineCount() - 1;
    const endOfLine = getLineEndPos(line, editor);
    ch = endOfLine.ch;
  }
  return { anchor: { line, ch } };
};
var moveCursor = (editor, direction) => {
  switch (direction) {
    case "up":
      editor.exec("goUp");
      break;
    case "down":
      editor.exec("goDown");
      break;
    case "left":
      editor.exec("goLeft");
      break;
    case "right":
      editor.exec("goRight");
      break;
  }
};
var moveWord = (editor, direction) => {
  switch (direction) {
    case "left":
      editor.exec("goWordLeft");
      break;
    case "right":
      editor.exec("goWordRight");
      break;
  }
};
var transformCase = (editor, selection, caseType) => {
  let { from, to } = getSelectionBoundaries(selection);
  let selectedText = editor.getRange(from, to);
  if (selectedText.length === 0) {
    const pos = selection.head;
    const { anchor, head } = wordRangeAtPos(pos, editor.getLine(pos.line));
    [from, to] = [anchor, head];
    selectedText = editor.getRange(anchor, head);
  }
  let replacementText = selectedText;
  switch (caseType) {
    case CASE.UPPER: {
      replacementText = selectedText.toUpperCase();
      break;
    }
    case CASE.LOWER: {
      replacementText = selectedText.toLowerCase();
      break;
    }
    case CASE.TITLE: {
      replacementText = toTitleCase(selectedText);
      break;
    }
    case CASE.NEXT: {
      replacementText = getNextCase(selectedText);
      break;
    }
  }
  editor.replaceRange(replacementText, from, to);
  return selection;
};
var expandSelection = ({
  editor,
  selection,
  openingCharacterCheck,
  matchingCharacterMap
}) => {
  let { anchor, head } = selection;
  if (anchor.line >= head.line && anchor.ch > anchor.ch) {
    [anchor, head] = [head, anchor];
  }
  const newAnchor = findPosOfNextCharacter({
    editor,
    startPos: anchor,
    checkCharacter: openingCharacterCheck,
    searchDirection: SEARCH_DIRECTION.BACKWARD
  });
  if (!newAnchor) {
    return selection;
  }
  const newHead = findPosOfNextCharacter({
    editor,
    startPos: head,
    checkCharacter: (char) => char === matchingCharacterMap[newAnchor.match],
    searchDirection: SEARCH_DIRECTION.FORWARD
  });
  if (!newHead) {
    return selection;
  }
  return { anchor: newAnchor.pos, head: newHead.pos };
};
var expandSelectionToBrackets = (editor, selection) => expandSelection({
  editor,
  selection,
  openingCharacterCheck: (char) => /[([{]/.test(char),
  matchingCharacterMap: MATCHING_BRACKETS
});
var expandSelectionToQuotes = (editor, selection) => expandSelection({
  editor,
  selection,
  openingCharacterCheck: (char) => /['"`]/.test(char),
  matchingCharacterMap: MATCHING_QUOTES
});
var expandSelectionToQuotesOrBrackets = (editor) => {
  const selections = editor.listSelections();
  const newSelection = expandSelection({
    editor,
    selection: selections[0],
    openingCharacterCheck: (char) => /['"`([{]/.test(char),
    matchingCharacterMap: MATCHING_QUOTES_BRACKETS
  });
  editor.setSelections([...selections, newSelection]);
};
var insertCursor = (editor, lineOffset) => {
  const selections = editor.listSelections();
  const newSelections = [];
  for (const selection of selections) {
    const { line, ch } = selection.head;
    if (line === 0 && lineOffset < 0 || line === editor.lastLine() && lineOffset > 0) {
      break;
    }
    const targetLineLength = editor.getLine(line + lineOffset).length;
    newSelections.push({
      anchor: {
        line: selection.anchor.line + lineOffset,
        ch: Math.min(selection.anchor.ch, targetLineLength)
      },
      head: {
        line: line + lineOffset,
        ch: Math.min(ch, targetLineLength)
      }
    });
  }
  editor.setSelections([...editor.listSelections(), ...newSelections]);
};
var insertCursorAbove = (editor) => insertCursor(editor, -1);
var insertCursorBelow = (editor) => insertCursor(editor, 1);
var goToHeading = (app, editor, boundary) => {
  const file = app.metadataCache.getFileCache(app.workspace.getActiveFile());
  if (!file.headings || file.headings.length === 0) {
    return;
  }
  const { line } = editor.getCursor("from");
  let prevHeadingLine = 0;
  let nextHeadingLine = editor.lastLine();
  file.headings.forEach(({ position }) => {
    const { end: headingPos } = position;
    if (line > headingPos.line && headingPos.line > prevHeadingLine) {
      prevHeadingLine = headingPos.line;
    }
    if (line < headingPos.line && headingPos.line < nextHeadingLine) {
      nextHeadingLine = headingPos.line;
    }
  });
  editor.setSelection(boundary === "prev" ? getLineEndPos(prevHeadingLine, editor) : getLineEndPos(nextHeadingLine, editor));
};

// src/settings.ts
var import_obsidian = __toModule(require("obsidian"));
var DEFAULT_SETTINGS = {
  autoInsertListPrefix: true
};
var SettingTab = class extends import_obsidian.PluginSettingTab {
  constructor(app, plugin) {
    super(app, plugin);
    this.plugin = plugin;
  }
  display() {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl("h2", { text: "Code Editor Shortcuts" });
    const listPrefixSetting = new import_obsidian.Setting(containerEl).setName("Auto insert list prefix").setDesc("Automatically insert list prefix when inserting a line above or below").addToggle((toggle) => toggle.setValue(this.plugin.settings.autoInsertListPrefix).onChange((value) => __async(this, null, function* () {
      this.plugin.settings.autoInsertListPrefix = value;
      yield this.plugin.saveSettings();
    })));
    new import_obsidian.Setting(containerEl).setName("Reset defaults").addButton((btn) => {
      btn.setButtonText("Reset").onClick(() => __async(this, null, function* () {
        this.plugin.settings = __spreadValues({}, DEFAULT_SETTINGS);
        listPrefixSetting.components[0].setValue(DEFAULT_SETTINGS.autoInsertListPrefix);
        yield this.plugin.saveSettings();
      }));
    });
  }
};

// src/modals.ts
var import_obsidian2 = __toModule(require("obsidian"));
var GoToLineModal = class extends import_obsidian2.SuggestModal {
  constructor(app, lineCount, onSubmit) {
    super(app);
    this.lineCount = lineCount;
    this.onSubmit = onSubmit;
    const PROMPT_TEXT = `Enter a line number between 1 and ${lineCount}`;
    this.limit = 1;
    this.setPlaceholder(PROMPT_TEXT);
    this.emptyStateText = PROMPT_TEXT;
  }
  getSuggestions(line) {
    const lineNumber = parseInt(line);
    if (line.length > 0 && lineNumber > 0 && lineNumber <= this.lineCount) {
      return [line];
    }
    return [];
  }
  renderSuggestion(line, el) {
    el.createEl("div", { text: line });
  }
  onChooseSuggestion(line) {
    this.onSubmit(parseInt(line) - 1);
  }
};

// src/main.ts
var CodeEditorShortcuts = class extends import_obsidian3.Plugin {
  onload() {
    return __async(this, null, function* () {
      yield this.loadSettings();
      this.addCommand({
        id: "insertLineAbove",
        name: "Insert line above",
        hotkeys: [
          {
            modifiers: ["Mod", "Shift"],
            key: "Enter"
          }
        ],
        editorCallback: (editor) => withMultipleSelectionsNew(editor, insertLineAbove)
      });
      this.addCommand({
        id: "insertLineBelow",
        name: "Insert line below",
        hotkeys: [
          {
            modifiers: ["Mod"],
            key: "Enter"
          }
        ],
        editorCallback: (editor) => withMultipleSelectionsNew(editor, insertLineBelow)
      });
      this.addCommand({
        id: "deleteLine",
        name: "Delete line",
        hotkeys: [
          {
            modifiers: ["Mod", "Shift"],
            key: "K"
          }
        ],
        editorCallback: (editor) => withMultipleSelectionsNew(editor, deleteLine, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
          combineSameLineSelections: true
        }))
      });
      this.addCommand({
        id: "deleteToStartOfLine",
        name: "Delete to start of line",
        editorCallback: (editor) => withMultipleSelections(editor, deleteToStartOfLine)
      });
      this.addCommand({
        id: "deleteToEndOfLine",
        name: "Delete to end of line",
        editorCallback: (editor) => withMultipleSelections(editor, deleteToEndOfLine)
      });
      this.addCommand({
        id: "joinLines",
        name: "Join lines",
        hotkeys: [
          {
            modifiers: ["Mod"],
            key: "J"
          }
        ],
        editorCallback: (editor) => withMultipleSelections(editor, joinLines, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
          repeatSameLineActions: false
        }))
      });
      this.addCommand({
        id: "duplicateLine",
        name: "Duplicate line",
        hotkeys: [
          {
            modifiers: ["Mod", "Shift"],
            key: "D"
          }
        ],
        editorCallback: (editor) => withMultipleSelections(editor, copyLine, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
          args: "down"
        }))
      });
      this.addCommand({
        id: "copyLineUp",
        name: "Copy line up",
        hotkeys: [
          {
            modifiers: ["Alt", "Shift"],
            key: "ArrowUp"
          }
        ],
        editorCallback: (editor) => withMultipleSelections(editor, copyLine, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
          args: "up"
        }))
      });
      this.addCommand({
        id: "copyLineDown",
        name: "Copy line down",
        hotkeys: [
          {
            modifiers: ["Alt", "Shift"],
            key: "ArrowDown"
          }
        ],
        editorCallback: (editor) => withMultipleSelections(editor, copyLine, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
          args: "down"
        }))
      });
      this.addCommand({
        id: "selectWordOrNextOccurrence",
        name: "Select word or next occurrence",
        hotkeys: [
          {
            modifiers: ["Mod"],
            key: "D"
          }
        ],
        editorCallback: (editor) => selectWordOrNextOccurrence(editor)
      });
      this.addCommand({
        id: "selectAllOccurrences",
        name: "Select all occurrences",
        hotkeys: [
          {
            modifiers: ["Mod", "Shift"],
            key: "L"
          }
        ],
        editorCallback: (editor) => selectAllOccurrences(editor)
      });
      this.addCommand({
        id: "selectLine",
        name: "Select line",
        hotkeys: [
          {
            modifiers: ["Mod"],
            key: "L"
          }
        ],
        editorCallback: (editor) => withMultipleSelections(editor, selectLine)
      });
      this.addCommand({
        id: "select5LinesDown",
        name: "Select 5 lines down",
        editorCallback: (editor) => withMultipleSelections(editor, select5LinesDown)
      });
      this.addCommand({
        id: "select5LinesUp",
        name: "Select 5 lines up",
        editorCallback: (editor) => withMultipleSelections(editor, select5LinesUp)
      });
      this.addCommand({
        id: "select10LinesDown",
        name: "Select 10 lines down",
        editorCallback: (editor) => withMultipleSelections(editor, select10LinesDown)
      });
      this.addCommand({
        id: "select10LinesUp",
        name: "Select 10 lines up",
        editorCallback: (editor) => withMultipleSelections(editor, select10LinesUp)
      });
      this.addCommand({
        id: "addCursorsToSelectionEnds",
        name: "Add cursors to selection ends",
        hotkeys: [
          {
            modifiers: ["Alt", "Shift"],
            key: "I"
          }
        ],
        editorCallback: (editor) => addCursorsToSelectionEnds(editor)
      });
      this.addCommand({
        id: "goToLineStart",
        name: "Go to start of line",
        editorCallback: (editor) => withMultipleSelections(editor, goToLineBoundary, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
          args: "start"
        }))
      });
      this.addCommand({
        id: "goToLineEnd",
        name: "Go to end of line",
        editorCallback: (editor) => withMultipleSelections(editor, goToLineBoundary, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
          args: "end"
        }))
      });
      this.addCommand({
        id: "goToNextLine",
        name: "Go to next line",
        editorCallback: (editor) => withMultipleSelections(editor, navigateLine, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
          args: "next"
        }))
      });
      this.addCommand({
        id: "goToPrevLine",
        name: "Go to previous line",
        editorCallback: (editor) => withMultipleSelections(editor, navigateLine, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
          args: "prev"
        }))
      });
      this.addCommand({
        id: "goToFirstLine",
        name: "Go to first line",
        editorCallback: (editor) => withMultipleSelections(editor, navigateLine, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
          args: "first"
        }))
      });
      this.addCommand({
        id: "goToLastLine",
        name: "Go to last line",
        editorCallback: (editor) => withMultipleSelections(editor, navigateLine, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
          args: "last"
        }))
      });
      this.addCommand({
        id: "goToLineNumber",
        name: "Go to line number",
        editorCallback: (editor) => {
          const lineCount = editor.lineCount();
          const onSubmit = (line) => editor.setCursor({ line, ch: 0 });
          new GoToLineModal(this.app, lineCount, onSubmit).open();
        }
      });
      this.addCommand({
        id: "moveCursor10LinesUp",
        name: "Move cursor 10 lines up",
        editorCallback: (editor) => {
          const pos = editor.getCursor();
          const newPos = { line: pos.line - 10, ch: 0 };
          editor.setCursor(newPos);
        }
      });
      this.addCommand({
        id: "moveCursor10LinesDown",
        name: "Move cursor 10 lines down",
        editorCallback: (editor) => {
          const pos = editor.getCursor();
          const newPos = { line: pos.line + 10, ch: 0 };
          editor.setCursor(newPos);
        }
      });
      this.addCommand({
        id: "moveCursor5LinesUp",
        name: "Move cursor 5 lines up",
        editorCallback: (editor) => {
          const pos = editor.getCursor();
          const newPos = { line: pos.line - 5, ch: 0 };
          editor.setCursor(newPos);
        }
      });
      this.addCommand({
        id: "moveCursor5LinesDown",
        name: "Move cursor 5 lines down",
        editorCallback: (editor) => {
          const pos = editor.getCursor();
          const newPos = { line: pos.line + 5, ch: 0 };
          editor.setCursor(newPos);
        }
      });
      this.addCommand({
        id: "goToNextChar",
        name: "Move cursor forward",
        editorCallback: (editor) => moveCursor(editor, "right")
      });
      this.addCommand({
        id: "goToPrevChar",
        name: "Move cursor backward",
        editorCallback: (editor) => moveCursor(editor, "left")
      });
      this.addCommand({
        id: "moveCursorUp",
        name: "Move cursor up",
        editorCallback: (editor) => moveCursor(editor, "up")
      });
      this.addCommand({
        id: "moveCursorDown",
        name: "Move cursor down",
        editorCallback: (editor) => moveCursor(editor, "down")
      });
      this.addCommand({
        id: "goToPreviousWord",
        name: "Go to previous word",
        editorCallback: (editor) => moveWord(editor, "left")
      });
      this.addCommand({
        id: "goToNextWord",
        name: "Go to next word",
        editorCallback: (editor) => moveWord(editor, "right")
      });
      this.addCommand({
        id: "transformToUppercase",
        name: "Transform selection to uppercase",
        editorCallback: (editor) => withMultipleSelections(editor, transformCase, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
          args: CASE.UPPER
        }))
      });
      this.addCommand({
        id: "transformToLowercase",
        name: "Transform selection to lowercase",
        editorCallback: (editor) => withMultipleSelections(editor, transformCase, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
          args: CASE.LOWER
        }))
      });
      this.addCommand({
        id: "transformToTitlecase",
        name: "Transform selection to title case",
        editorCallback: (editor) => withMultipleSelections(editor, transformCase, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
          args: CASE.TITLE
        }))
      });
      this.addCommand({
        id: "toggleCase",
        name: "Toggle case of selection",
        editorCallback: (editor) => withMultipleSelections(editor, transformCase, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
          args: CASE.NEXT
        }))
      });
      this.addCommand({
        id: "expandSelectionToBrackets",
        name: "Expand selection to brackets",
        editorCallback: (editor) => withMultipleSelections(editor, expandSelectionToBrackets)
      });
      this.addCommand({
        id: "expandSelectionToQuotes",
        name: "Expand selection to quotes",
        editorCallback: (editor) => withMultipleSelections(editor, expandSelectionToQuotes)
      });
      this.addCommand({
        id: "expandSelectionToQuotesOrBrackets",
        name: "Expand selection to quotes or brackets",
        editorCallback: (editor) => expandSelectionToQuotesOrBrackets(editor)
      });
      this.addCommand({
        id: "insertCursorAbove",
        name: "Insert cursor above",
        editorCallback: (editor) => insertCursorAbove(editor)
      });
      this.addCommand({
        id: "insertCursorBelow",
        name: "Insert cursor below",
        editorCallback: (editor) => insertCursorBelow(editor)
      });
      this.addCommand({
        id: "goToNextHeading",
        name: "Go to next heading",
        editorCallback: (editor) => goToHeading(this.app, editor, "next")
      });
      this.addCommand({
        id: "goToPrevHeading",
        name: "Go to previous heading",
        editorCallback: (editor) => goToHeading(this.app, editor, "prev")
      });
      this.addCommand({
        id: "toggle-line-numbers",
        name: "Toggle line numbers",
        callback: () => toggleVaultConfig(this.app, "showLineNumber")
      });
      this.addCommand({
        id: "indent-using-tabs",
        name: "Indent using tabs",
        callback: () => setVaultConfig(this.app, "useTab", true)
      });
      this.addCommand({
        id: "indent-using-spaces",
        name: "Indent using spaces",
        callback: () => setVaultConfig(this.app, "useTab", false)
      });
      this.addCommand({
        id: "undo",
        name: "Undo",
        editorCallback: (editor) => editor.undo()
      });
      this.addCommand({
        id: "redo",
        name: "Redo",
        editorCallback: (editor) => editor.redo()
      });
      this.registerSelectionChangeListeners();
      this.addSettingTab(new SettingTab(this.app, this));
    });
  }
  registerSelectionChangeListeners() {
    this.app.workspace.onLayoutReady(() => {
      const handleSelectionChange = (evt) => {
        if (evt instanceof KeyboardEvent && MODIFIER_KEYS.includes(evt.key)) {
          return;
        }
        if (!isProgrammaticSelectionChange) {
          setIsManualSelection(true);
        }
        setIsProgrammaticSelectionChange(false);
      };
      iterateCodeMirrorDivs((cm) => {
        this.registerDomEvent(cm, "keydown", handleSelectionChange);
        this.registerDomEvent(cm, "click", handleSelectionChange);
        this.registerDomEvent(cm, "dblclick", handleSelectionChange);
      });
    });
  }
  loadSettings() {
    return __async(this, null, function* () {
      const savedSettings = yield this.loadData();
      this.settings = __spreadValues(__spreadValues({}, DEFAULT_SETTINGS), savedSettings);
      SettingsState.autoInsertListPrefix = this.settings.autoInsertListPrefix;
    });
  }
  saveSettings() {
    return __async(this, null, function* () {
      yield this.saveData(this.settings);
      SettingsState.autoInsertListPrefix = this.settings.autoInsertListPrefix;
    });
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL2NvbnN0YW50cy50cyIsICJzcmMvc3RhdGUudHMiLCAic3JjL3V0aWxzLnRzIiwgInNyYy9hY3Rpb25zLnRzIiwgInNyYy9zZXR0aW5ncy50cyIsICJzcmMvbW9kYWxzLnRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJpbXBvcnQgeyBQbHVnaW4sIEVkaXRvclBvc2l0aW9uIH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IHtcbiAgYWRkQ3Vyc29yc1RvU2VsZWN0aW9uRW5kcyxcbiAgY29weUxpbmUsXG4gIGRlbGV0ZUxpbmUsXG4gIGRlbGV0ZVRvU3RhcnRPZkxpbmUsXG4gIGRlbGV0ZVRvRW5kT2ZMaW5lLFxuICBleHBhbmRTZWxlY3Rpb25Ub0JyYWNrZXRzLFxuICBleHBhbmRTZWxlY3Rpb25Ub1F1b3RlcyxcbiAgZXhwYW5kU2VsZWN0aW9uVG9RdW90ZXNPckJyYWNrZXRzLFxuICBnb1RvSGVhZGluZyxcbiAgZ29Ub0xpbmVCb3VuZGFyeSxcbiAgaW5zZXJ0TGluZUFib3ZlLFxuICBpbnNlcnRMaW5lQmVsb3csXG4gIGpvaW5MaW5lcyxcbiAgbW92ZUN1cnNvcixcbiAgbmF2aWdhdGVMaW5lLFxuICBpc1Byb2dyYW1tYXRpY1NlbGVjdGlvbkNoYW5nZSxcbiAgc2VsZWN0QWxsT2NjdXJyZW5jZXMsXG4gIHNlbGVjdExpbmUsXG4gIHNlbGVjdDVMaW5lc0Rvd24sXG4gIHNlbGVjdDVMaW5lc1VwLFxuICBzZWxlY3QxMExpbmVzRG93bixcbiAgc2VsZWN0MTBMaW5lc1VwLFxuICBzZWxlY3RXb3JkT3JOZXh0T2NjdXJyZW5jZSxcbiAgc2V0SXNNYW51YWxTZWxlY3Rpb24sXG4gIHNldElzUHJvZ3JhbW1hdGljU2VsZWN0aW9uQ2hhbmdlLFxuICB0cmFuc2Zvcm1DYXNlLFxuICBpbnNlcnRDdXJzb3JBYm92ZSxcbiAgaW5zZXJ0Q3Vyc29yQmVsb3csXG4gIG1vdmVXb3JkLFxufSBmcm9tICcuL2FjdGlvbnMnO1xuaW1wb3J0IHtcbiAgZGVmYXVsdE11bHRpcGxlU2VsZWN0aW9uT3B0aW9ucyxcbiAgaXRlcmF0ZUNvZGVNaXJyb3JEaXZzLFxuICBzZXRWYXVsdENvbmZpZyxcbiAgdG9nZ2xlVmF1bHRDb25maWcsXG4gIHdpdGhNdWx0aXBsZVNlbGVjdGlvbnMsXG4gIHdpdGhNdWx0aXBsZVNlbGVjdGlvbnNOZXcsXG59IGZyb20gJy4vdXRpbHMnO1xuaW1wb3J0IHsgQ0FTRSwgTU9ESUZJRVJfS0VZUyB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IFNldHRpbmdUYWIsIERFRkFVTFRfU0VUVElOR1MsIFBsdWdpblNldHRpbmdzIH0gZnJvbSAnLi9zZXR0aW5ncyc7XG5pbXBvcnQgeyBTZXR0aW5nc1N0YXRlIH0gZnJvbSAnLi9zdGF0ZSc7XG5pbXBvcnQgeyBHb1RvTGluZU1vZGFsIH0gZnJvbSAnLi9tb2RhbHMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2RlRWRpdG9yU2hvcnRjdXRzIGV4dGVuZHMgUGx1Z2luIHtcbiAgc2V0dGluZ3M6IFBsdWdpblNldHRpbmdzO1xuXG4gIGFzeW5jIG9ubG9hZCgpIHtcbiAgICBhd2FpdCB0aGlzLmxvYWRTZXR0aW5ncygpO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnaW5zZXJ0TGluZUFib3ZlJyxcbiAgICAgIG5hbWU6ICdJbnNlcnQgbGluZSBhYm92ZScsXG4gICAgICBob3RrZXlzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBtb2RpZmllcnM6IFsnTW9kJywgJ1NoaWZ0J10sXG4gICAgICAgICAga2V5OiAnRW50ZXInLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zTmV3KGVkaXRvciwgaW5zZXJ0TGluZUFib3ZlKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ2luc2VydExpbmVCZWxvdycsXG4gICAgICBuYW1lOiAnSW5zZXJ0IGxpbmUgYmVsb3cnLFxuICAgICAgaG90a2V5czogW1xuICAgICAgICB7XG4gICAgICAgICAgbW9kaWZpZXJzOiBbJ01vZCddLFxuICAgICAgICAgIGtleTogJ0VudGVyJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT5cbiAgICAgICAgd2l0aE11bHRpcGxlU2VsZWN0aW9uc05ldyhlZGl0b3IsIGluc2VydExpbmVCZWxvdyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdkZWxldGVMaW5lJyxcbiAgICAgIG5hbWU6ICdEZWxldGUgbGluZScsXG4gICAgICBob3RrZXlzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBtb2RpZmllcnM6IFsnTW9kJywgJ1NoaWZ0J10sXG4gICAgICAgICAga2V5OiAnSycsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+XG4gICAgICAgIHdpdGhNdWx0aXBsZVNlbGVjdGlvbnNOZXcoZWRpdG9yLCBkZWxldGVMaW5lLCB7XG4gICAgICAgICAgLi4uZGVmYXVsdE11bHRpcGxlU2VsZWN0aW9uT3B0aW9ucyxcbiAgICAgICAgICBjb21iaW5lU2FtZUxpbmVTZWxlY3Rpb25zOiB0cnVlLFxuICAgICAgICB9KSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ2RlbGV0ZVRvU3RhcnRPZkxpbmUnLFxuICAgICAgbmFtZTogJ0RlbGV0ZSB0byBzdGFydCBvZiBsaW5lJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgZGVsZXRlVG9TdGFydE9mTGluZSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdkZWxldGVUb0VuZE9mTGluZScsXG4gICAgICBuYW1lOiAnRGVsZXRlIHRvIGVuZCBvZiBsaW5lJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgZGVsZXRlVG9FbmRPZkxpbmUpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnam9pbkxpbmVzJyxcbiAgICAgIG5hbWU6ICdKb2luIGxpbmVzJyxcbiAgICAgIGhvdGtleXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG1vZGlmaWVyczogWydNb2QnXSxcbiAgICAgICAgICBrZXk6ICdKJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT5cbiAgICAgICAgd2l0aE11bHRpcGxlU2VsZWN0aW9ucyhlZGl0b3IsIGpvaW5MaW5lcywge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgcmVwZWF0U2FtZUxpbmVBY3Rpb25zOiBmYWxzZSxcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdkdXBsaWNhdGVMaW5lJyxcbiAgICAgIG5hbWU6ICdEdXBsaWNhdGUgbGluZScsXG4gICAgICBob3RrZXlzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBtb2RpZmllcnM6IFsnTW9kJywgJ1NoaWZ0J10sXG4gICAgICAgICAga2V5OiAnRCcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+XG4gICAgICAgIHdpdGhNdWx0aXBsZVNlbGVjdGlvbnMoZWRpdG9yLCBjb3B5TGluZSwge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgYXJnczogJ2Rvd24nLFxuICAgICAgICB9KSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ2NvcHlMaW5lVXAnLFxuICAgICAgbmFtZTogJ0NvcHkgbGluZSB1cCcsXG4gICAgICBob3RrZXlzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBtb2RpZmllcnM6IFsnQWx0JywgJ1NoaWZ0J10sXG4gICAgICAgICAga2V5OiAnQXJyb3dVcCcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+XG4gICAgICAgIHdpdGhNdWx0aXBsZVNlbGVjdGlvbnMoZWRpdG9yLCBjb3B5TGluZSwge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgYXJnczogJ3VwJyxcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdjb3B5TGluZURvd24nLFxuICAgICAgbmFtZTogJ0NvcHkgbGluZSBkb3duJyxcbiAgICAgIGhvdGtleXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG1vZGlmaWVyczogWydBbHQnLCAnU2hpZnQnXSxcbiAgICAgICAgICBrZXk6ICdBcnJvd0Rvd24nLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgY29weUxpbmUsIHtcbiAgICAgICAgICAuLi5kZWZhdWx0TXVsdGlwbGVTZWxlY3Rpb25PcHRpb25zLFxuICAgICAgICAgIGFyZ3M6ICdkb3duJyxcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdzZWxlY3RXb3JkT3JOZXh0T2NjdXJyZW5jZScsXG4gICAgICBuYW1lOiAnU2VsZWN0IHdvcmQgb3IgbmV4dCBvY2N1cnJlbmNlJyxcbiAgICAgIGhvdGtleXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG1vZGlmaWVyczogWydNb2QnXSxcbiAgICAgICAgICBrZXk6ICdEJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4gc2VsZWN0V29yZE9yTmV4dE9jY3VycmVuY2UoZWRpdG9yKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ3NlbGVjdEFsbE9jY3VycmVuY2VzJyxcbiAgICAgIG5hbWU6ICdTZWxlY3QgYWxsIG9jY3VycmVuY2VzJyxcbiAgICAgIGhvdGtleXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG1vZGlmaWVyczogWydNb2QnLCAnU2hpZnQnXSxcbiAgICAgICAgICBrZXk6ICdMJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4gc2VsZWN0QWxsT2NjdXJyZW5jZXMoZWRpdG9yKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ3NlbGVjdExpbmUnLFxuICAgICAgbmFtZTogJ1NlbGVjdCBsaW5lJyxcbiAgICAgIGhvdGtleXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG1vZGlmaWVyczogWydNb2QnXSxcbiAgICAgICAgICBrZXk6ICdMJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4gd2l0aE11bHRpcGxlU2VsZWN0aW9ucyhlZGl0b3IsIHNlbGVjdExpbmUpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnc2VsZWN0NUxpbmVzRG93bicsXG4gICAgICBuYW1lOiAnU2VsZWN0IDUgbGluZXMgZG93bicsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4gd2l0aE11bHRpcGxlU2VsZWN0aW9ucyhlZGl0b3IsIHNlbGVjdDVMaW5lc0Rvd24pLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnc2VsZWN0NUxpbmVzVXAnLFxuICAgICAgbmFtZTogJ1NlbGVjdCA1IGxpbmVzIHVwJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgc2VsZWN0NUxpbmVzVXApLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnc2VsZWN0MTBMaW5lc0Rvd24nLFxuICAgICAgbmFtZTogJ1NlbGVjdCAxMCBsaW5lcyBkb3duJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgc2VsZWN0MTBMaW5lc0Rvd24pLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnc2VsZWN0MTBMaW5lc1VwJyxcbiAgICAgIG5hbWU6ICdTZWxlY3QgMTAgbGluZXMgdXAnLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+IHdpdGhNdWx0aXBsZVNlbGVjdGlvbnMoZWRpdG9yLCBzZWxlY3QxMExpbmVzVXApLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnYWRkQ3Vyc29yc1RvU2VsZWN0aW9uRW5kcycsXG4gICAgICBuYW1lOiAnQWRkIGN1cnNvcnMgdG8gc2VsZWN0aW9uIGVuZHMnLFxuICAgICAgaG90a2V5czogW1xuICAgICAgICB7XG4gICAgICAgICAgbW9kaWZpZXJzOiBbJ0FsdCcsICdTaGlmdCddLFxuICAgICAgICAgIGtleTogJ0knLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiBhZGRDdXJzb3JzVG9TZWxlY3Rpb25FbmRzKGVkaXRvciksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdnb1RvTGluZVN0YXJ0JyxcbiAgICAgIG5hbWU6ICdHbyB0byBzdGFydCBvZiBsaW5lJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgZ29Ub0xpbmVCb3VuZGFyeSwge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgYXJnczogJ3N0YXJ0JyxcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdnb1RvTGluZUVuZCcsXG4gICAgICBuYW1lOiAnR28gdG8gZW5kIG9mIGxpbmUnLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+XG4gICAgICAgIHdpdGhNdWx0aXBsZVNlbGVjdGlvbnMoZWRpdG9yLCBnb1RvTGluZUJvdW5kYXJ5LCB7XG4gICAgICAgICAgLi4uZGVmYXVsdE11bHRpcGxlU2VsZWN0aW9uT3B0aW9ucyxcbiAgICAgICAgICBhcmdzOiAnZW5kJyxcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdnb1RvTmV4dExpbmUnLFxuICAgICAgbmFtZTogJ0dvIHRvIG5leHQgbGluZScsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT5cbiAgICAgICAgd2l0aE11bHRpcGxlU2VsZWN0aW9ucyhlZGl0b3IsIG5hdmlnYXRlTGluZSwge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgYXJnczogJ25leHQnLFxuICAgICAgICB9KSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ2dvVG9QcmV2TGluZScsXG4gICAgICBuYW1lOiAnR28gdG8gcHJldmlvdXMgbGluZScsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT5cbiAgICAgICAgd2l0aE11bHRpcGxlU2VsZWN0aW9ucyhlZGl0b3IsIG5hdmlnYXRlTGluZSwge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgYXJnczogJ3ByZXYnLFxuICAgICAgICB9KSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ2dvVG9GaXJzdExpbmUnLFxuICAgICAgbmFtZTogJ0dvIHRvIGZpcnN0IGxpbmUnLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+XG4gICAgICAgIHdpdGhNdWx0aXBsZVNlbGVjdGlvbnMoZWRpdG9yLCBuYXZpZ2F0ZUxpbmUsIHtcbiAgICAgICAgICAuLi5kZWZhdWx0TXVsdGlwbGVTZWxlY3Rpb25PcHRpb25zLFxuICAgICAgICAgIGFyZ3M6ICdmaXJzdCcsXG4gICAgICAgIH0pLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnZ29Ub0xhc3RMaW5lJyxcbiAgICAgIG5hbWU6ICdHbyB0byBsYXN0IGxpbmUnLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+XG4gICAgICAgIHdpdGhNdWx0aXBsZVNlbGVjdGlvbnMoZWRpdG9yLCBuYXZpZ2F0ZUxpbmUsIHtcbiAgICAgICAgICAuLi5kZWZhdWx0TXVsdGlwbGVTZWxlY3Rpb25PcHRpb25zLFxuICAgICAgICAgIGFyZ3M6ICdsYXN0JyxcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdnb1RvTGluZU51bWJlcicsXG4gICAgICBuYW1lOiAnR28gdG8gbGluZSBudW1iZXInLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+IHtcbiAgICAgICAgY29uc3QgbGluZUNvdW50ID0gZWRpdG9yLmxpbmVDb3VudCgpO1xuICAgICAgICBjb25zdCBvblN1Ym1pdCA9IChsaW5lOiBudW1iZXIpID0+IGVkaXRvci5zZXRDdXJzb3IoeyBsaW5lLCBjaDogMCB9KTtcbiAgICAgICAgbmV3IEdvVG9MaW5lTW9kYWwodGhpcy5hcHAsIGxpbmVDb3VudCwgb25TdWJtaXQpLm9wZW4oKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdtb3ZlQ3Vyc29yMTBMaW5lc1VwJyxcbiAgICAgIG5hbWU6ICdNb3ZlIGN1cnNvciAxMCBsaW5lcyB1cCcsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4ge1xuICAgICAgICBjb25zdCBwb3MgPSBlZGl0b3IuZ2V0Q3Vyc29yKCk7XG4gICAgICAgIGNvbnN0IG5ld1BvczogRWRpdG9yUG9zaXRpb24gPSB7bGluZTogcG9zLmxpbmUgLSAxMCwgY2g6IDB9XG4gICAgICAgIGVkaXRvci5zZXRDdXJzb3IobmV3UG9zKTtcbiAgICAgIH0sXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdtb3ZlQ3Vyc29yMTBMaW5lc0Rvd24nLFxuICAgICAgbmFtZTogJ01vdmUgY3Vyc29yIDEwIGxpbmVzIGRvd24nLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+IHtcbiAgICAgICAgY29uc3QgcG9zID0gZWRpdG9yLmdldEN1cnNvcigpO1xuICAgICAgICBjb25zdCBuZXdQb3M6IEVkaXRvclBvc2l0aW9uID0ge2xpbmU6IHBvcy5saW5lICsgMTAsIGNoOiAwfVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yKG5ld1Bvcyk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbW92ZUN1cnNvcjVMaW5lc1VwJyxcbiAgICAgIG5hbWU6ICdNb3ZlIGN1cnNvciA1IGxpbmVzIHVwJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiB7XG4gICAgICAgIGNvbnN0IHBvcyA9IGVkaXRvci5nZXRDdXJzb3IoKTtcbiAgICAgICAgY29uc3QgbmV3UG9zOiBFZGl0b3JQb3NpdGlvbiA9IHtsaW5lOiBwb3MubGluZSAtIDUsIGNoOiAwfVxuICAgICAgICBlZGl0b3Iuc2V0Q3Vyc29yKG5ld1Bvcyk7XG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnbW92ZUN1cnNvcjVMaW5lc0Rvd24nLFxuICAgICAgbmFtZTogJ01vdmUgY3Vyc29yIDUgbGluZXMgZG93bicsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4ge1xuICAgICAgICBjb25zdCBwb3MgPSBlZGl0b3IuZ2V0Q3Vyc29yKCk7XG4gICAgICAgIGNvbnN0IG5ld1BvczogRWRpdG9yUG9zaXRpb24gPSB7bGluZTogcG9zLmxpbmUgKyA1LCBjaDogMH1cbiAgICAgICAgZWRpdG9yLnNldEN1cnNvcihuZXdQb3MpO1xuICAgICAgfSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ2dvVG9OZXh0Q2hhcicsXG4gICAgICBuYW1lOiAnTW92ZSBjdXJzb3IgZm9yd2FyZCcsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4gbW92ZUN1cnNvcihlZGl0b3IsICdyaWdodCcpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnZ29Ub1ByZXZDaGFyJyxcbiAgICAgIG5hbWU6ICdNb3ZlIGN1cnNvciBiYWNrd2FyZCcsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4gbW92ZUN1cnNvcihlZGl0b3IsICdsZWZ0JyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdtb3ZlQ3Vyc29yVXAnLFxuICAgICAgbmFtZTogJ01vdmUgY3Vyc29yIHVwJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiBtb3ZlQ3Vyc29yKGVkaXRvciwgJ3VwJyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdtb3ZlQ3Vyc29yRG93bicsXG4gICAgICBuYW1lOiAnTW92ZSBjdXJzb3IgZG93bicsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4gbW92ZUN1cnNvcihlZGl0b3IsICdkb3duJyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdnb1RvUHJldmlvdXNXb3JkJyxcbiAgICAgIG5hbWU6ICdHbyB0byBwcmV2aW91cyB3b3JkJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiBtb3ZlV29yZChlZGl0b3IsICdsZWZ0JyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdnb1RvTmV4dFdvcmQnLFxuICAgICAgbmFtZTogJ0dvIHRvIG5leHQgd29yZCcsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4gbW92ZVdvcmQoZWRpdG9yLCAncmlnaHQnKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ3RyYW5zZm9ybVRvVXBwZXJjYXNlJyxcbiAgICAgIG5hbWU6ICdUcmFuc2Zvcm0gc2VsZWN0aW9uIHRvIHVwcGVyY2FzZScsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT5cbiAgICAgICAgd2l0aE11bHRpcGxlU2VsZWN0aW9ucyhlZGl0b3IsIHRyYW5zZm9ybUNhc2UsIHtcbiAgICAgICAgICAuLi5kZWZhdWx0TXVsdGlwbGVTZWxlY3Rpb25PcHRpb25zLFxuICAgICAgICAgIGFyZ3M6IENBU0UuVVBQRVIsXG4gICAgICAgIH0pLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAndHJhbnNmb3JtVG9Mb3dlcmNhc2UnLFxuICAgICAgbmFtZTogJ1RyYW5zZm9ybSBzZWxlY3Rpb24gdG8gbG93ZXJjYXNlJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgdHJhbnNmb3JtQ2FzZSwge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgYXJnczogQ0FTRS5MT1dFUixcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICd0cmFuc2Zvcm1Ub1RpdGxlY2FzZScsXG4gICAgICBuYW1lOiAnVHJhbnNmb3JtIHNlbGVjdGlvbiB0byB0aXRsZSBjYXNlJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgdHJhbnNmb3JtQ2FzZSwge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgYXJnczogQ0FTRS5USVRMRSxcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICd0b2dnbGVDYXNlJyxcbiAgICAgIG5hbWU6ICdUb2dnbGUgY2FzZSBvZiBzZWxlY3Rpb24nLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+XG4gICAgICAgIHdpdGhNdWx0aXBsZVNlbGVjdGlvbnMoZWRpdG9yLCB0cmFuc2Zvcm1DYXNlLCB7XG4gICAgICAgICAgLi4uZGVmYXVsdE11bHRpcGxlU2VsZWN0aW9uT3B0aW9ucyxcbiAgICAgICAgICBhcmdzOiBDQVNFLk5FWFQsXG4gICAgICAgIH0pLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnZXhwYW5kU2VsZWN0aW9uVG9CcmFja2V0cycsXG4gICAgICBuYW1lOiAnRXhwYW5kIHNlbGVjdGlvbiB0byBicmFja2V0cycsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT5cbiAgICAgICAgd2l0aE11bHRpcGxlU2VsZWN0aW9ucyhlZGl0b3IsIGV4cGFuZFNlbGVjdGlvblRvQnJhY2tldHMpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnZXhwYW5kU2VsZWN0aW9uVG9RdW90ZXMnLFxuICAgICAgbmFtZTogJ0V4cGFuZCBzZWxlY3Rpb24gdG8gcXVvdGVzJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgZXhwYW5kU2VsZWN0aW9uVG9RdW90ZXMpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnZXhwYW5kU2VsZWN0aW9uVG9RdW90ZXNPckJyYWNrZXRzJyxcbiAgICAgIG5hbWU6ICdFeHBhbmQgc2VsZWN0aW9uIHRvIHF1b3RlcyBvciBicmFja2V0cycsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4gZXhwYW5kU2VsZWN0aW9uVG9RdW90ZXNPckJyYWNrZXRzKGVkaXRvciksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdpbnNlcnRDdXJzb3JBYm92ZScsXG4gICAgICBuYW1lOiAnSW5zZXJ0IGN1cnNvciBhYm92ZScsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4gaW5zZXJ0Q3Vyc29yQWJvdmUoZWRpdG9yKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ2luc2VydEN1cnNvckJlbG93JyxcbiAgICAgIG5hbWU6ICdJbnNlcnQgY3Vyc29yIGJlbG93JyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiBpbnNlcnRDdXJzb3JCZWxvdyhlZGl0b3IpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnZ29Ub05leHRIZWFkaW5nJyxcbiAgICAgIG5hbWU6ICdHbyB0byBuZXh0IGhlYWRpbmcnLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+IGdvVG9IZWFkaW5nKHRoaXMuYXBwLCBlZGl0b3IsICduZXh0JyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdnb1RvUHJldkhlYWRpbmcnLFxuICAgICAgbmFtZTogJ0dvIHRvIHByZXZpb3VzIGhlYWRpbmcnLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+IGdvVG9IZWFkaW5nKHRoaXMuYXBwLCBlZGl0b3IsICdwcmV2JyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICd0b2dnbGUtbGluZS1udW1iZXJzJyxcbiAgICAgIG5hbWU6ICdUb2dnbGUgbGluZSBudW1iZXJzJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiB0b2dnbGVWYXVsdENvbmZpZyh0aGlzLmFwcCwgJ3Nob3dMaW5lTnVtYmVyJyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdpbmRlbnQtdXNpbmctdGFicycsXG4gICAgICBuYW1lOiAnSW5kZW50IHVzaW5nIHRhYnMnLFxuICAgICAgY2FsbGJhY2s6ICgpID0+IHNldFZhdWx0Q29uZmlnKHRoaXMuYXBwLCAndXNlVGFiJywgdHJ1ZSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdpbmRlbnQtdXNpbmctc3BhY2VzJyxcbiAgICAgIG5hbWU6ICdJbmRlbnQgdXNpbmcgc3BhY2VzJyxcbiAgICAgIGNhbGxiYWNrOiAoKSA9PiBzZXRWYXVsdENvbmZpZyh0aGlzLmFwcCwgJ3VzZVRhYicsIGZhbHNlKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ3VuZG8nLFxuICAgICAgbmFtZTogJ1VuZG8nLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+IGVkaXRvci51bmRvKCksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdyZWRvJyxcbiAgICAgIG5hbWU6ICdSZWRvJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiBlZGl0b3IucmVkbygpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5yZWdpc3RlclNlbGVjdGlvbkNoYW5nZUxpc3RlbmVycygpO1xuXG4gICAgdGhpcy5hZGRTZXR0aW5nVGFiKG5ldyBTZXR0aW5nVGFiKHRoaXMuYXBwLCB0aGlzKSk7XG4gIH1cblxuICBwcml2YXRlIHJlZ2lzdGVyU2VsZWN0aW9uQ2hhbmdlTGlzdGVuZXJzKCkge1xuICAgIHRoaXMuYXBwLndvcmtzcGFjZS5vbkxheW91dFJlYWR5KCgpID0+IHtcbiAgICAgIC8vIENoYW5nZSBoYW5kbGVyIGZvciBzZWxlY3RXb3JkT3JOZXh0T2NjdXJyZW5jZVxuICAgICAgY29uc3QgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlID0gKGV2dDogRXZlbnQpID0+IHtcbiAgICAgICAgaWYgKGV2dCBpbnN0YW5jZW9mIEtleWJvYXJkRXZlbnQgJiYgTU9ESUZJRVJfS0VZUy5pbmNsdWRlcyhldnQua2V5KSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWlzUHJvZ3JhbW1hdGljU2VsZWN0aW9uQ2hhbmdlKSB7XG4gICAgICAgICAgc2V0SXNNYW51YWxTZWxlY3Rpb24odHJ1ZSk7XG4gICAgICAgIH1cbiAgICAgICAgc2V0SXNQcm9ncmFtbWF0aWNTZWxlY3Rpb25DaGFuZ2UoZmFsc2UpO1xuICAgICAgfTtcbiAgICAgIGl0ZXJhdGVDb2RlTWlycm9yRGl2cygoY206IEhUTUxFbGVtZW50KSA9PiB7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJEb21FdmVudChjbSwgJ2tleWRvd24nLCBoYW5kbGVTZWxlY3Rpb25DaGFuZ2UpO1xuICAgICAgICB0aGlzLnJlZ2lzdGVyRG9tRXZlbnQoY20sICdjbGljaycsIGhhbmRsZVNlbGVjdGlvbkNoYW5nZSk7XG4gICAgICAgIHRoaXMucmVnaXN0ZXJEb21FdmVudChjbSwgJ2RibGNsaWNrJywgaGFuZGxlU2VsZWN0aW9uQ2hhbmdlKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG5cbiAgYXN5bmMgbG9hZFNldHRpbmdzKCkge1xuICAgIGNvbnN0IHNhdmVkU2V0dGluZ3MgPSBhd2FpdCB0aGlzLmxvYWREYXRhKCk7XG4gICAgdGhpcy5zZXR0aW5ncyA9IHtcbiAgICAgIC4uLkRFRkFVTFRfU0VUVElOR1MsXG4gICAgICAuLi5zYXZlZFNldHRpbmdzLFxuICAgIH07XG4gICAgU2V0dGluZ3NTdGF0ZS5hdXRvSW5zZXJ0TGlzdFByZWZpeCA9IHRoaXMuc2V0dGluZ3MuYXV0b0luc2VydExpc3RQcmVmaXg7XG4gIH1cblxuICBhc3luYyBzYXZlU2V0dGluZ3MoKSB7XG4gICAgYXdhaXQgdGhpcy5zYXZlRGF0YSh0aGlzLnNldHRpbmdzKTtcbiAgICBTZXR0aW5nc1N0YXRlLmF1dG9JbnNlcnRMaXN0UHJlZml4ID0gdGhpcy5zZXR0aW5ncy5hdXRvSW5zZXJ0TGlzdFByZWZpeDtcbiAgfVxufVxuIiwgImV4cG9ydCBlbnVtIENBU0Uge1xuICBVUFBFUiA9ICd1cHBlcicsXG4gIExPV0VSID0gJ2xvd2VyJyxcbiAgVElUTEUgPSAndGl0bGUnLFxuICBORVhUID0gJ25leHQnLFxufVxuXG5leHBvcnQgY29uc3QgTE9XRVJDQVNFX0FSVElDTEVTID0gWyd0aGUnLCAnYScsICdhbiddO1xuXG5leHBvcnQgZW51bSBTRUFSQ0hfRElSRUNUSU9OIHtcbiAgRk9SV0FSRCA9ICdmb3J3YXJkJyxcbiAgQkFDS1dBUkQgPSAnYmFja3dhcmQnLFxufVxuXG5leHBvcnQgdHlwZSBNYXRjaGluZ0NoYXJhY3Rlck1hcCA9IHsgW2tleTogc3RyaW5nXTogc3RyaW5nIH07XG5cbmV4cG9ydCBjb25zdCBNQVRDSElOR19CUkFDS0VUUzogTWF0Y2hpbmdDaGFyYWN0ZXJNYXAgPSB7XG4gICdbJzogJ10nLFxuICAnKCc6ICcpJyxcbiAgJ3snOiAnfScsXG59O1xuXG5leHBvcnQgY29uc3QgTUFUQ0hJTkdfUVVPVEVTOiBNYXRjaGluZ0NoYXJhY3Rlck1hcCA9IHtcbiAgXCInXCI6IFwiJ1wiLFxuICAnXCInOiAnXCInLFxuICAnYCc6ICdgJyxcbn07XG5cbmV4cG9ydCBjb25zdCBNQVRDSElOR19RVU9URVNfQlJBQ0tFVFM6IE1hdGNoaW5nQ2hhcmFjdGVyTWFwID0ge1xuICAuLi5NQVRDSElOR19RVU9URVMsXG4gIC4uLk1BVENISU5HX0JSQUNLRVRTLFxufTtcblxuZXhwb3J0IGVudW0gQ09ERV9FRElUT1Ige1xuICBTVUJMSU1FID0gJ3N1YmxpbWUnLFxuICBWU0NPREUgPSAndnNjb2RlJyxcbn1cblxuZXhwb3J0IGNvbnN0IE1PRElGSUVSX0tFWVMgPSBbXG4gICdDb250cm9sJyxcbiAgJ1NoaWZ0JyxcbiAgJ0FsdCcsXG4gICdNZXRhJyxcbiAgJ0NhcHNMb2NrJyxcbiAgJ0ZuJyxcbl07XG5cbi8qKlxuICogQ2FwdHVyZXMgdGhlIHByZWZpeCAoaW5jbHVkaW5nIHNwYWNlKSBmb3IgYnVsbGV0IGxpc3RzLCBudW1iZXJlZCBsaXN0c1xuICogYW5kIGNoZWNrbGlzdHNcbiAqL1xuZXhwb3J0IGNvbnN0IExJU1RfQ0hBUkFDVEVSX1JFR0VYID0gL15cXHMqKC18XFwrfFxcKnxcXGQrXFwufD4pIChcXFsuXFxdICk/LztcbiIsICJ0eXBlIENvZGVFZGl0b3JTaG9ydGN1dHNTdGF0ZSA9IHtcbiAgYXV0b0luc2VydExpc3RQcmVmaXg6IGJvb2xlYW47XG59O1xuXG4vKipcbiAqIFNpbXBsZSBzdGF0ZSBvYmplY3QgdXNlZCB0byBob2xkIGluZm9ybWF0aW9uIGZyb20gc2F2ZWQgc2V0dGluZ3MgKGFjY2Vzc2libGVcbiAqIGFueXdoZXJlIGl0J3MgaW1wb3J0ZWQgd2l0aG91dCBuZWVkaW5nIHRvIHRocmVhZCBpdCBkb3duIHRvIGRlcGVuZGVudFxuICogZnVuY3Rpb25zIGFzIGFuIGFyZ3VtZW50KVxuICovXG5leHBvcnQgY29uc3QgU2V0dGluZ3NTdGF0ZTogQ29kZUVkaXRvclNob3J0Y3V0c1N0YXRlID0ge1xuICBhdXRvSW5zZXJ0TGlzdFByZWZpeDogdHJ1ZSxcbn07XG4iLCAiaW1wb3J0IHtcbiAgQXBwLFxuICBFZGl0b3IsXG4gIEVkaXRvckNoYW5nZSxcbiAgRWRpdG9yUmFuZ2VPckNhcmV0LFxuICBFZGl0b3JQb3NpdGlvbixcbiAgRWRpdG9yU2VsZWN0aW9uLFxuICBFZGl0b3JTZWxlY3Rpb25PckNhcmV0LFxufSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQge1xuICBTRUFSQ0hfRElSRUNUSU9OLFxuICBMT1dFUkNBU0VfQVJUSUNMRVMsXG4gIExJU1RfQ0hBUkFDVEVSX1JFR0VYLFxufSBmcm9tICcuL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBDdXN0b21TZWxlY3Rpb25IYW5kbGVyIH0gZnJvbSAnLi9jdXN0b20tc2VsZWN0aW9uLWhhbmRsZXJzJztcblxudHlwZSBFZGl0b3JBY3Rpb25DYWxsYmFja05ldyA9IChcbiAgZWRpdG9yOiBFZGl0b3IsXG4gIHNlbGVjdGlvbjogRWRpdG9yU2VsZWN0aW9uLFxuICBhcmdzOiBhbnksXG4pID0+IHsgY2hhbmdlczogRWRpdG9yQ2hhbmdlW107IG5ld1NlbGVjdGlvbjogRWRpdG9yUmFuZ2VPckNhcmV0IH07XG5cbnR5cGUgRWRpdG9yQWN0aW9uQ2FsbGJhY2sgPSAoXG4gIGVkaXRvcjogRWRpdG9yLFxuICBzZWxlY3Rpb246IEVkaXRvclNlbGVjdGlvbixcbiAgYXJnczogc3RyaW5nLFxuKSA9PiBFZGl0b3JTZWxlY3Rpb25PckNhcmV0O1xuXG50eXBlIE11bHRpcGxlU2VsZWN0aW9uT3B0aW9ucyA9IHtcbiAgLy8gQWRkaXRpb25hbCBpbmZvcm1hdGlvbiB0byBiZSBwYXNzZWQgdG8gdGhlIEVkaXRvckFjdGlvbkNhbGxiYWNrXG4gIGFyZ3M/OiBzdHJpbmc7XG5cbiAgLy8gUGVyZm9ybSBmdXJ0aGVyIHByb2Nlc3Npbmcgb2YgbmV3IHNlbGVjdGlvbnMgYmVmb3JlIHRoZXkgYXJlIHNldFxuICBjdXN0b21TZWxlY3Rpb25IYW5kbGVyPzogQ3VzdG9tU2VsZWN0aW9uSGFuZGxlcjtcblxuICAvLyBXaGV0aGVyIHRoZSBhY3Rpb24gc2hvdWxkIGJlIHJlcGVhdGVkIGZvciBjdXJzb3JzIG9uIHRoZSBzYW1lIGxpbmVcbiAgcmVwZWF0U2FtZUxpbmVBY3Rpb25zPzogYm9vbGVhbjtcbn07XG5cbmV4cG9ydCB0eXBlIEVkaXRvckFjdGlvbkNhbGxiYWNrTmV3QXJncyA9IFJlY29yZDxzdHJpbmcsIGFueT47XG5cbnR5cGUgTXVsdGlwbGVTZWxlY3Rpb25PcHRpb25zTmV3ID0ge1xuICAvLyBBZGRpdGlvbmFsIGluZm9ybWF0aW9uIHRvIGJlIHBhc3NlZCB0byB0aGUgRWRpdG9yQWN0aW9uQ2FsbGJhY2tcbiAgYXJncz86IEVkaXRvckFjdGlvbkNhbGxiYWNrTmV3QXJncztcblxuICAvLyBXaGV0aGVyIHRoZSBhY3Rpb24gc2hvdWxkIGJlIHJlcGVhdGVkIGZvciBjdXJzb3JzIG9uIHRoZSBzYW1lIGxpbmVcbiAgcmVwZWF0U2FtZUxpbmVBY3Rpb25zPzogYm9vbGVhbjtcblxuICAvLyBXaGV0aGVyIHRvIGNvbWJpbmUgY3Vyc29ycyBvbiB0aGUgc2FtZSBsaW5lIGFmdGVyIHRoZSBvcGVyYXRpb24gaGFzXG4gIC8vIGZpbmlzaGVkICh0aGUgY3Vyc29yIHdpdGggYSBzbWFsbGVyIGxpbmUgbnVtYmVyIHRha2VzIHByZWNlZGVuY2UpXG4gIGNvbWJpbmVTYW1lTGluZVNlbGVjdGlvbnM/OiBib29sZWFuO1xufTtcblxuZXhwb3J0IGNvbnN0IGRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMgPSB7IHJlcGVhdFNhbWVMaW5lQWN0aW9uczogdHJ1ZSB9O1xuXG5leHBvcnQgY29uc3Qgd2l0aE11bHRpcGxlU2VsZWN0aW9uc05ldyA9IChcbiAgZWRpdG9yOiBFZGl0b3IsXG4gIGNhbGxiYWNrOiBFZGl0b3JBY3Rpb25DYWxsYmFja05ldyxcbiAgb3B0aW9uczogTXVsdGlwbGVTZWxlY3Rpb25PcHRpb25zTmV3ID0gZGVmYXVsdE11bHRpcGxlU2VsZWN0aW9uT3B0aW9ucyxcbikgPT4ge1xuICBjb25zdCBzZWxlY3Rpb25zID0gZWRpdG9yLmxpc3RTZWxlY3Rpb25zKCk7XG4gIGxldCBzZWxlY3Rpb25JbmRleGVzVG9Qcm9jZXNzOiBudW1iZXJbXTtcbiAgY29uc3QgbmV3U2VsZWN0aW9uczogRWRpdG9yUmFuZ2VPckNhcmV0W10gPSBbXTtcbiAgY29uc3QgY2hhbmdlczogRWRpdG9yQ2hhbmdlW10gPSBbXTtcblxuICBpZiAoIW9wdGlvbnMucmVwZWF0U2FtZUxpbmVBY3Rpb25zKSB7XG4gICAgY29uc3Qgc2VlbkxpbmVzOiBudW1iZXJbXSA9IFtdO1xuICAgIHNlbGVjdGlvbkluZGV4ZXNUb1Byb2Nlc3MgPSBzZWxlY3Rpb25zLnJlZHVjZShcbiAgICAgIChpbmRleGVzLCBjdXJyU2VsZWN0aW9uLCBjdXJySW5kZXgpID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudExpbmUgPSBjdXJyU2VsZWN0aW9uLmhlYWQubGluZTtcbiAgICAgICAgaWYgKCFzZWVuTGluZXMuaW5jbHVkZXMoY3VycmVudExpbmUpKSB7XG4gICAgICAgICAgc2VlbkxpbmVzLnB1c2goY3VycmVudExpbmUpO1xuICAgICAgICAgIGluZGV4ZXMucHVzaChjdXJySW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbmRleGVzO1xuICAgICAgfSxcbiAgICAgIFtdLFxuICAgICk7XG4gIH1cblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHNlbGVjdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAvLyBDb250cm9sbGVkIGJ5IHJlcGVhdFNhbWVMaW5lQWN0aW9uc1xuICAgIGlmIChzZWxlY3Rpb25JbmRleGVzVG9Qcm9jZXNzICYmICFzZWxlY3Rpb25JbmRleGVzVG9Qcm9jZXNzLmluY2x1ZGVzKGkpKSB7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG5cbiAgICBjb25zdCB7IGNoYW5nZXM6IG5ld0NoYW5nZXMsIG5ld1NlbGVjdGlvbiB9ID0gY2FsbGJhY2soXG4gICAgICBlZGl0b3IsXG4gICAgICBzZWxlY3Rpb25zW2ldLFxuICAgICAge1xuICAgICAgICAuLi5vcHRpb25zLmFyZ3MsXG4gICAgICAgIGl0ZXJhdGlvbjogaSxcbiAgICAgIH0sXG4gICAgKTtcbiAgICBjaGFuZ2VzLnB1c2goLi4ubmV3Q2hhbmdlcyk7XG5cbiAgICBpZiAob3B0aW9ucy5jb21iaW5lU2FtZUxpbmVTZWxlY3Rpb25zKSB7XG4gICAgICBjb25zdCBleGlzdGluZ1NhbWVMaW5lU2VsZWN0aW9uID0gbmV3U2VsZWN0aW9ucy5maW5kKFxuICAgICAgICAoc2VsZWN0aW9uKSA9PiBzZWxlY3Rpb24uZnJvbS5saW5lID09PSBuZXdTZWxlY3Rpb24uZnJvbS5saW5lLFxuICAgICAgKTtcbiAgICAgIC8vIEdlbmVyYWxseSBvbmx5IGhhcHBlbnMgd2hlbiBkZWxldGluZyBjb25zZWN1dGl2ZSBsaW5lcyB1c2luZyBzZXBhcmF0ZSBjdXJzb3JzXG4gICAgICBpZiAoZXhpc3RpbmdTYW1lTGluZVNlbGVjdGlvbikge1xuICAgICAgICAvLyBSZXNldCB0byAwIGFzIGBjaGAgd2lsbCBvdGhlcndpc2UgZXhjZWVkIHRoZSBsaW5lIGxlbmd0aFxuICAgICAgICBleGlzdGluZ1NhbWVMaW5lU2VsZWN0aW9uLmZyb20uY2ggPSAwO1xuICAgICAgICAvLyBTa2lwIGFkZGluZyBhIG5ldyBzZWxlY3Rpb24gd2l0aCB0aGUgc2FtZSBsaW5lIG51bWJlclxuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBuZXdTZWxlY3Rpb25zLnB1c2gobmV3U2VsZWN0aW9uKTtcbiAgfVxuXG4gIGVkaXRvci50cmFuc2FjdGlvbih7XG4gICAgY2hhbmdlcyxcbiAgICBzZWxlY3Rpb25zOiBuZXdTZWxlY3Rpb25zLFxuICB9KTtcbn07XG5cbmV4cG9ydCBjb25zdCB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zID0gKFxuICBlZGl0b3I6IEVkaXRvcixcbiAgY2FsbGJhY2s6IEVkaXRvckFjdGlvbkNhbGxiYWNrLFxuICBvcHRpb25zOiBNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMgPSBkZWZhdWx0TXVsdGlwbGVTZWxlY3Rpb25PcHRpb25zLFxuKSA9PiB7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3I6IE9ic2lkaWFuJ3MgRWRpdG9yIGludGVyZmFjZSBkb2VzIG5vdCBleHBsaWNpdGx5XG4gIC8vIGluY2x1ZGUgdGhlIENvZGVNaXJyb3IgY20gb2JqZWN0LCBidXQgaXQgaXMgdGhlcmUgd2hlbiB1c2luZyB0aGVcbiAgLy8gbGVnYWN5IGVkaXRvclxuICBjb25zdCB7IGNtIH0gPSBlZGl0b3I7XG5cbiAgY29uc3Qgc2VsZWN0aW9ucyA9IGVkaXRvci5saXN0U2VsZWN0aW9ucygpO1xuICBsZXQgc2VsZWN0aW9uSW5kZXhlc1RvUHJvY2VzczogbnVtYmVyW107XG4gIGxldCBuZXdTZWxlY3Rpb25zOiBFZGl0b3JTZWxlY3Rpb25PckNhcmV0W10gPSBbXTtcblxuICBpZiAoIW9wdGlvbnMucmVwZWF0U2FtZUxpbmVBY3Rpb25zKSB7XG4gICAgY29uc3Qgc2VlbkxpbmVzOiBudW1iZXJbXSA9IFtdO1xuICAgIHNlbGVjdGlvbkluZGV4ZXNUb1Byb2Nlc3MgPSBzZWxlY3Rpb25zLnJlZHVjZShcbiAgICAgIChpbmRleGVzLCBjdXJyU2VsZWN0aW9uLCBjdXJySW5kZXgpID0+IHtcbiAgICAgICAgY29uc3QgY3VycmVudExpbmUgPSBjdXJyU2VsZWN0aW9uLmhlYWQubGluZTtcbiAgICAgICAgaWYgKCFzZWVuTGluZXMuaW5jbHVkZXMoY3VycmVudExpbmUpKSB7XG4gICAgICAgICAgc2VlbkxpbmVzLnB1c2goY3VycmVudExpbmUpO1xuICAgICAgICAgIGluZGV4ZXMucHVzaChjdXJySW5kZXgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBpbmRleGVzO1xuICAgICAgfSxcbiAgICAgIFtdLFxuICAgICk7XG4gIH1cblxuICBjb25zdCBhcHBseUNhbGxiYWNrT25TZWxlY3Rpb25zID0gKCkgPT4ge1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2VsZWN0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gQ29udHJvbGxlZCBieSByZXBlYXRTYW1lTGluZUFjdGlvbnNcbiAgICAgIGlmIChzZWxlY3Rpb25JbmRleGVzVG9Qcm9jZXNzICYmICFzZWxlY3Rpb25JbmRleGVzVG9Qcm9jZXNzLmluY2x1ZGVzKGkpKSB7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICAvLyBDYW4ndCByZXVzZSBzZWxlY3Rpb25zIHZhcmlhYmxlIGFzIHBvc2l0aW9ucyBtYXkgY2hhbmdlIG9uIGVhY2ggaXRlcmF0aW9uXG4gICAgICBjb25zdCBzZWxlY3Rpb24gPSBlZGl0b3IubGlzdFNlbGVjdGlvbnMoKVtpXTtcblxuICAgICAgLy8gU2VsZWN0aW9ucyBtYXkgZGlzYXBwZWFyIChlLmcuIHJ1bm5pbmcgZGVsZXRlIGxpbmUgZm9yIHR3byBjdXJzb3JzIG9uIHRoZSBzYW1lIGxpbmUpXG4gICAgICBpZiAoc2VsZWN0aW9uKSB7XG4gICAgICAgIGNvbnN0IG5ld1NlbGVjdGlvbiA9IGNhbGxiYWNrKGVkaXRvciwgc2VsZWN0aW9uLCBvcHRpb25zLmFyZ3MpO1xuICAgICAgICBuZXdTZWxlY3Rpb25zLnB1c2gobmV3U2VsZWN0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5jdXN0b21TZWxlY3Rpb25IYW5kbGVyKSB7XG4gICAgICBuZXdTZWxlY3Rpb25zID0gb3B0aW9ucy5jdXN0b21TZWxlY3Rpb25IYW5kbGVyKG5ld1NlbGVjdGlvbnMpO1xuICAgIH1cbiAgICBlZGl0b3Iuc2V0U2VsZWN0aW9ucyhuZXdTZWxlY3Rpb25zKTtcbiAgfTtcblxuICBpZiAoY20gJiYgY20ub3BlcmF0aW9uKSB7XG4gICAgLy8gR3JvdXAgYWxsIHRoZSB1cGRhdGVzIGludG8gb25lIGF0b21pYyBvcGVyYXRpb24gKHNvIHVuZG8vcmVkbyB3b3JrIGFzIGV4cGVjdGVkKVxuICAgIGNtLm9wZXJhdGlvbihhcHBseUNhbGxiYWNrT25TZWxlY3Rpb25zKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBTYWZlIGZhbGxiYWNrIGlmIGNtIGRvZXNuJ3QgZXhpc3QgKHNvIHVuZG8vcmVkbyB3aWxsIHN0ZXAgdGhyb3VnaCBlYWNoIGNoYW5nZSlcbiAgICBjb25zb2xlLmRlYnVnKCdjbSBvYmplY3Qgbm90IGZvdW5kLCBvcGVyYXRpb25zIHdpbGwgbm90IGJlIGJ1ZmZlcmVkJyk7XG4gICAgYXBwbHlDYWxsYmFja09uU2VsZWN0aW9ucygpO1xuICB9XG59O1xuXG4vKipcbiAqIEV4ZWN1dGVzIHRoZSBzdXBwbGllZCBjYWxsYmFjayBmb3IgZWFjaCB0b3AtbGV2ZWwgQ29kZU1pcnJvciBkaXYgZWxlbWVudCBpbiB0aGVcbiAqIERPTS4gVGhpcyBpcyBhbiBpbnRlcmltIHV0aWwgbWFkZSB0byB3b3JrIHdpdGggYm90aCBDTTUgYW5kIENNNiBhcyBPYnNpZGlhbidzXG4gKiBgaXRlcmF0ZUNvZGVNaXJyb3JzYCBtZXRob2Qgb25seSB3b3JrcyB3aXRoIENNNS5cbiAqL1xuZXhwb3J0IGNvbnN0IGl0ZXJhdGVDb2RlTWlycm9yRGl2cyA9IChjYWxsYmFjazogKGNtOiBIVE1MRWxlbWVudCkgPT4gYW55KSA9PiB7XG4gIGxldCBjb2RlTWlycm9yczogTm9kZUxpc3RPZjxIVE1MRWxlbWVudD47XG4gIGNvZGVNaXJyb3JzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmNtLWNvbnRlbnQnKTsgLy8gQ002XG4gIGlmIChjb2RlTWlycm9ycy5sZW5ndGggPT09IDApIHtcbiAgICBjb2RlTWlycm9ycyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5Db2RlTWlycm9yJyk7IC8vIENNNVxuICB9XG4gIGNvZGVNaXJyb3JzLmZvckVhY2goY2FsbGJhY2spO1xufTtcblxuZXhwb3J0IGNvbnN0IGdldExpbmVTdGFydFBvcyA9IChsaW5lOiBudW1iZXIpOiBFZGl0b3JQb3NpdGlvbiA9PiAoe1xuICBsaW5lLFxuICBjaDogMCxcbn0pO1xuXG5leHBvcnQgY29uc3QgZ2V0TGluZUVuZFBvcyA9IChcbiAgbGluZTogbnVtYmVyLFxuICBlZGl0b3I6IEVkaXRvcixcbik6IEVkaXRvclBvc2l0aW9uID0+ICh7XG4gIGxpbmUsXG4gIGNoOiBlZGl0b3IuZ2V0TGluZShsaW5lKS5sZW5ndGgsXG59KTtcblxuZXhwb3J0IGNvbnN0IGdldFNlbGVjdGlvbkJvdW5kYXJpZXMgPSAoc2VsZWN0aW9uOiBFZGl0b3JTZWxlY3Rpb24pID0+IHtcbiAgbGV0IHsgYW5jaG9yOiBmcm9tLCBoZWFkOiB0byB9ID0gc2VsZWN0aW9uO1xuXG4gIC8vIEluIGNhc2UgdXNlciBzZWxlY3RzIHVwd2FyZHNcbiAgaWYgKGZyb20ubGluZSA+IHRvLmxpbmUpIHtcbiAgICBbZnJvbSwgdG9dID0gW3RvLCBmcm9tXTtcbiAgfVxuXG4gIC8vIEluIGNhc2UgdXNlciBzZWxlY3RzIGJhY2t3YXJkcyBvbiB0aGUgc2FtZSBsaW5lXG4gIGlmIChmcm9tLmxpbmUgPT09IHRvLmxpbmUgJiYgZnJvbS5jaCA+IHRvLmNoKSB7XG4gICAgW2Zyb20sIHRvXSA9IFt0bywgZnJvbV07XG4gIH1cblxuICByZXR1cm4geyBmcm9tLCB0bywgaGFzVHJhaWxpbmdOZXdsaW5lOiB0by5saW5lID4gZnJvbS5saW5lICYmIHRvLmNoID09PSAwIH07XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0TGVhZGluZ1doaXRlc3BhY2UgPSAobGluZUNvbnRlbnQ6IHN0cmluZykgPT4ge1xuICBjb25zdCBpbmRlbnRhdGlvbiA9IGxpbmVDb250ZW50Lm1hdGNoKC9eXFxzKy8pO1xuICByZXR1cm4gaW5kZW50YXRpb24gPyBpbmRlbnRhdGlvblswXSA6ICcnO1xufTtcblxuLy8gTWF0Y2ggYW55IGNoYXJhY3RlciBmcm9tIGFueSBsYW5ndWFnZTogaHR0cHM6Ly93d3cucmVndWxhci1leHByZXNzaW9ucy5pbmZvL3VuaWNvZGUuaHRtbFxuY29uc3QgaXNMZXR0ZXJDaGFyYWN0ZXIgPSAoY2hhcjogc3RyaW5nKSA9PiAvXFxwe0x9XFxwe019Ki91LnRlc3QoY2hhcik7XG5cbmNvbnN0IGlzRGlnaXQgPSAoY2hhcjogc3RyaW5nKSA9PiAvXFxkLy50ZXN0KGNoYXIpO1xuXG5jb25zdCBpc0xldHRlck9yRGlnaXQgPSAoY2hhcjogc3RyaW5nKSA9PlxuICBpc0xldHRlckNoYXJhY3RlcihjaGFyKSB8fCBpc0RpZ2l0KGNoYXIpO1xuXG5leHBvcnQgY29uc3Qgd29yZFJhbmdlQXRQb3MgPSAoXG4gIHBvczogRWRpdG9yUG9zaXRpb24sXG4gIGxpbmVDb250ZW50OiBzdHJpbmcsXG4pOiB7IGFuY2hvcjogRWRpdG9yUG9zaXRpb247IGhlYWQ6IEVkaXRvclBvc2l0aW9uIH0gPT4ge1xuICBsZXQgc3RhcnQgPSBwb3MuY2g7XG4gIGxldCBlbmQgPSBwb3MuY2g7XG4gIHdoaWxlIChzdGFydCA+IDAgJiYgaXNMZXR0ZXJPckRpZ2l0KGxpbmVDb250ZW50LmNoYXJBdChzdGFydCAtIDEpKSkge1xuICAgIHN0YXJ0LS07XG4gIH1cbiAgd2hpbGUgKGVuZCA8IGxpbmVDb250ZW50Lmxlbmd0aCAmJiBpc0xldHRlck9yRGlnaXQobGluZUNvbnRlbnQuY2hhckF0KGVuZCkpKSB7XG4gICAgZW5kKys7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBhbmNob3I6IHtcbiAgICAgIGxpbmU6IHBvcy5saW5lLFxuICAgICAgY2g6IHN0YXJ0LFxuICAgIH0sXG4gICAgaGVhZDoge1xuICAgICAgbGluZTogcG9zLmxpbmUsXG4gICAgICBjaDogZW5kLFxuICAgIH0sXG4gIH07XG59O1xuXG5leHBvcnQgdHlwZSBDaGVja0NoYXJhY3RlciA9IChjaGFyOiBzdHJpbmcpID0+IGJvb2xlYW47XG5cbmV4cG9ydCBjb25zdCBmaW5kUG9zT2ZOZXh0Q2hhcmFjdGVyID0gKHtcbiAgZWRpdG9yLFxuICBzdGFydFBvcyxcbiAgY2hlY2tDaGFyYWN0ZXIsXG4gIHNlYXJjaERpcmVjdGlvbixcbn06IHtcbiAgZWRpdG9yOiBFZGl0b3I7XG4gIHN0YXJ0UG9zOiBFZGl0b3JQb3NpdGlvbjtcbiAgY2hlY2tDaGFyYWN0ZXI6IENoZWNrQ2hhcmFjdGVyO1xuICBzZWFyY2hEaXJlY3Rpb246IFNFQVJDSF9ESVJFQ1RJT047XG59KSA9PiB7XG4gIGxldCB7IGxpbmUsIGNoIH0gPSBzdGFydFBvcztcbiAgbGV0IGxpbmVDb250ZW50ID0gZWRpdG9yLmdldExpbmUobGluZSk7XG4gIGxldCBtYXRjaEZvdW5kID0gZmFsc2U7XG4gIGxldCBtYXRjaGVkQ2hhcjogc3RyaW5nO1xuXG4gIGlmIChzZWFyY2hEaXJlY3Rpb24gPT09IFNFQVJDSF9ESVJFQ1RJT04uQkFDS1dBUkQpIHtcbiAgICB3aGlsZSAobGluZSA+PSAwKSB7XG4gICAgICAvLyBjaCB3aWxsIGluaXRpYWxseSBiZSAwIGlmIHNlYXJjaGluZyBmcm9tIHN0YXJ0IG9mIGxpbmVcbiAgICAgIGNvbnN0IGNoYXIgPSBsaW5lQ29udGVudC5jaGFyQXQoTWF0aC5tYXgoY2ggLSAxLCAwKSk7XG4gICAgICBtYXRjaEZvdW5kID0gY2hlY2tDaGFyYWN0ZXIoY2hhcik7XG4gICAgICBpZiAobWF0Y2hGb3VuZCkge1xuICAgICAgICBtYXRjaGVkQ2hhciA9IGNoYXI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2gtLTtcbiAgICAgIC8vIGluY2x1c2l2ZSBiZWNhdXNlIChjaCAtIDEpIG1lYW5zIHRoZSBmaXJzdCBjaGFyYWN0ZXIgd2lsbCBhbHJlYWR5XG4gICAgICAvLyBoYXZlIGJlZW4gY2hlY2tlZFxuICAgICAgaWYgKGNoIDw9IDApIHtcbiAgICAgICAgbGluZS0tO1xuICAgICAgICBpZiAobGluZSA+PSAwKSB7XG4gICAgICAgICAgbGluZUNvbnRlbnQgPSBlZGl0b3IuZ2V0TGluZShsaW5lKTtcbiAgICAgICAgICBjaCA9IGxpbmVDb250ZW50Lmxlbmd0aDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB3aGlsZSAobGluZSA8IGVkaXRvci5saW5lQ291bnQoKSkge1xuICAgICAgY29uc3QgY2hhciA9IGxpbmVDb250ZW50LmNoYXJBdChjaCk7XG4gICAgICBtYXRjaEZvdW5kID0gY2hlY2tDaGFyYWN0ZXIoY2hhcik7XG4gICAgICBpZiAobWF0Y2hGb3VuZCkge1xuICAgICAgICBtYXRjaGVkQ2hhciA9IGNoYXI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgICAgY2grKztcbiAgICAgIGlmIChjaCA+PSBsaW5lQ29udGVudC5sZW5ndGgpIHtcbiAgICAgICAgbGluZSsrO1xuICAgICAgICBsaW5lQ29udGVudCA9IGVkaXRvci5nZXRMaW5lKGxpbmUpO1xuICAgICAgICBjaCA9IDA7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG1hdGNoRm91bmRcbiAgICA/IHtcbiAgICAgICAgbWF0Y2g6IG1hdGNoZWRDaGFyLFxuICAgICAgICBwb3M6IHtcbiAgICAgICAgICBsaW5lLFxuICAgICAgICAgIGNoLFxuICAgICAgICB9LFxuICAgICAgfVxuICAgIDogbnVsbDtcbn07XG5cbmV4cG9ydCBjb25zdCBoYXNTYW1lU2VsZWN0aW9uQ29udGVudCA9IChcbiAgZWRpdG9yOiBFZGl0b3IsXG4gIHNlbGVjdGlvbnM6IEVkaXRvclNlbGVjdGlvbltdLFxuKSA9PlxuICBuZXcgU2V0KFxuICAgIHNlbGVjdGlvbnMubWFwKChzZWxlY3Rpb24pID0+IHtcbiAgICAgIGNvbnN0IHsgZnJvbSwgdG8gfSA9IGdldFNlbGVjdGlvbkJvdW5kYXJpZXMoc2VsZWN0aW9uKTtcbiAgICAgIHJldHVybiBlZGl0b3IuZ2V0UmFuZ2UoZnJvbSwgdG8pO1xuICAgIH0pLFxuICApLnNpemUgPT09IDE7XG5cbmV4cG9ydCBjb25zdCBnZXRTZWFyY2hUZXh0ID0gKHtcbiAgZWRpdG9yLFxuICBhbGxTZWxlY3Rpb25zLFxuICBhdXRvRXhwYW5kLFxufToge1xuICBlZGl0b3I6IEVkaXRvcjtcbiAgYWxsU2VsZWN0aW9uczogRWRpdG9yU2VsZWN0aW9uW107XG4gIGF1dG9FeHBhbmQ6IGJvb2xlYW47XG59KSA9PiB7XG4gIC8vIERvbid0IHNlYXJjaCBpZiBtdWx0aXBsZSBzZWxlY3Rpb24gY29udGVudHMgYXJlIG5vdCBpZGVudGljYWxcbiAgY29uc3Qgc2luZ2xlU2VhcmNoVGV4dCA9IGhhc1NhbWVTZWxlY3Rpb25Db250ZW50KGVkaXRvciwgYWxsU2VsZWN0aW9ucyk7XG4gIGNvbnN0IGZpcnN0U2VsZWN0aW9uID0gYWxsU2VsZWN0aW9uc1swXTtcbiAgY29uc3QgeyBmcm9tLCB0byB9ID0gZ2V0U2VsZWN0aW9uQm91bmRhcmllcyhmaXJzdFNlbGVjdGlvbik7XG4gIGxldCBzZWFyY2hUZXh0ID0gZWRpdG9yLmdldFJhbmdlKGZyb20sIHRvKTtcbiAgaWYgKHNlYXJjaFRleHQubGVuZ3RoID09PSAwICYmIGF1dG9FeHBhbmQpIHtcbiAgICBjb25zdCB3b3JkUmFuZ2UgPSB3b3JkUmFuZ2VBdFBvcyhmcm9tLCBlZGl0b3IuZ2V0TGluZShmcm9tLmxpbmUpKTtcbiAgICBzZWFyY2hUZXh0ID0gZWRpdG9yLmdldFJhbmdlKHdvcmRSYW5nZS5hbmNob3IsIHdvcmRSYW5nZS5oZWFkKTtcbiAgfVxuICByZXR1cm4ge1xuICAgIHNlYXJjaFRleHQsXG4gICAgc2luZ2xlU2VhcmNoVGV4dCxcbiAgfTtcbn07XG5cbi8qKlxuICogRXNjYXBlcyBhbnkgc3BlY2lhbCByZWdleCBjaGFyYWN0ZXJzIGluIHRoZSBnaXZlbiBzdHJpbmcuXG4gKlxuICogQWRhcHRlZCBmcm9tIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvR3VpZGUvUmVndWxhcl9FeHByZXNzaW9ucyNlc2NhcGluZ1xuICovXG5jb25zdCBlc2NhcGVSZWdleCA9IChpbnB1dDogc3RyaW5nKSA9PlxuICBpbnB1dC5yZXBsYWNlKC9bLiorP14ke30oKXxbXFxdXFxcXF0vZywgJ1xcXFwkJicpOyAvLyAkJiBtZWFucyB0aGUgd2hvbGUgbWF0Y2hlZCBzdHJpbmdcblxuLyoqXG4gKiBDb25zdHJ1Y3RzIGEgY3VzdG9tIHJlZ2V4IHF1ZXJ5IHdpdGggd29yZCBib3VuZGFyaWVzIGJlY2F1c2UgaW4gYFxcYmAgaW4gSlMgZG9lc24ndFxuICogbWF0Y2ggd29yZCBib3VuZGFyaWVzIGZvciB1bmljb2RlIGNoYXJhY3RlcnMsIGV2ZW4gd2l0aCB0aGUgdW5pY29kZSBmbGFnIG9uLlxuICpcbiAqIEFkYXB0ZWQgZnJvbSBodHRwczovL3NoaWJhMTAxNC5tZWRpdW0uY29tL3JlZ2V4LXdvcmQtYm91bmRhcmllcy13aXRoLXVuaWNvZGUtMjA3Nzk0ZjZlN2VkLlxuICovXG5jb25zdCB3aXRoV29yZEJvdW5kYXJpZXMgPSAoaW5wdXQ6IHN0cmluZykgPT4gYCg/PD1cXFxcV3xeKSR7aW5wdXR9KD89XFxcXFd8JClgO1xuXG5leHBvcnQgY29uc3QgZmluZEFsbE1hdGNoZXMgPSAoe1xuICBzZWFyY2hUZXh0LFxuICBzZWFyY2hXaXRoaW5Xb3JkcyxcbiAgZG9jdW1lbnRDb250ZW50LFxufToge1xuICBzZWFyY2hUZXh0OiBzdHJpbmc7XG4gIHNlYXJjaFdpdGhpbldvcmRzOiBib29sZWFuO1xuICBkb2N1bWVudENvbnRlbnQ6IHN0cmluZztcbn0pID0+IHtcbiAgY29uc3QgZXNjYXBlZFNlYXJjaFRleHQgPSBlc2NhcGVSZWdleChzZWFyY2hUZXh0KTtcbiAgY29uc3Qgc2VhcmNoRXhwcmVzc2lvbiA9IG5ldyBSZWdFeHAoXG4gICAgc2VhcmNoV2l0aGluV29yZHNcbiAgICAgID8gZXNjYXBlZFNlYXJjaFRleHRcbiAgICAgIDogd2l0aFdvcmRCb3VuZGFyaWVzKGVzY2FwZWRTZWFyY2hUZXh0KSxcbiAgICAnZycsXG4gICk7XG4gIHJldHVybiBBcnJheS5mcm9tKGRvY3VtZW50Q29udGVudC5tYXRjaEFsbChzZWFyY2hFeHByZXNzaW9uKSk7XG59O1xuXG5leHBvcnQgY29uc3QgZmluZE5leHRNYXRjaFBvc2l0aW9uID0gKHtcbiAgZWRpdG9yLFxuICBsYXRlc3RNYXRjaFBvcyxcbiAgc2VhcmNoVGV4dCxcbiAgc2VhcmNoV2l0aGluV29yZHMsXG4gIGRvY3VtZW50Q29udGVudCxcbn06IHtcbiAgZWRpdG9yOiBFZGl0b3I7XG4gIGxhdGVzdE1hdGNoUG9zOiBFZGl0b3JQb3NpdGlvbjtcbiAgc2VhcmNoVGV4dDogc3RyaW5nO1xuICBzZWFyY2hXaXRoaW5Xb3JkczogYm9vbGVhbjtcbiAgZG9jdW1lbnRDb250ZW50OiBzdHJpbmc7XG59KSA9PiB7XG4gIGNvbnN0IGxhdGVzdE1hdGNoT2Zmc2V0ID0gZWRpdG9yLnBvc1RvT2Zmc2V0KGxhdGVzdE1hdGNoUG9zKTtcbiAgY29uc3QgbWF0Y2hlcyA9IGZpbmRBbGxNYXRjaGVzKHtcbiAgICBzZWFyY2hUZXh0LFxuICAgIHNlYXJjaFdpdGhpbldvcmRzLFxuICAgIGRvY3VtZW50Q29udGVudCxcbiAgfSk7XG4gIGxldCBuZXh0TWF0Y2g6IEVkaXRvclNlbGVjdGlvbiB8IG51bGwgPSBudWxsO1xuXG4gIGZvciAoY29uc3QgbWF0Y2ggb2YgbWF0Y2hlcykge1xuICAgIGlmIChtYXRjaC5pbmRleCA+IGxhdGVzdE1hdGNoT2Zmc2V0KSB7XG4gICAgICBuZXh0TWF0Y2ggPSB7XG4gICAgICAgIGFuY2hvcjogZWRpdG9yLm9mZnNldFRvUG9zKG1hdGNoLmluZGV4KSxcbiAgICAgICAgaGVhZDogZWRpdG9yLm9mZnNldFRvUG9zKG1hdGNoLmluZGV4ICsgc2VhcmNoVGV4dC5sZW5ndGgpLFxuICAgICAgfTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICAvLyBDaXJjbGUgYmFjayB0byBzZWFyY2ggZnJvbSB0aGUgdG9wXG4gIGlmICghbmV4dE1hdGNoKSB7XG4gICAgY29uc3Qgc2VsZWN0aW9uSW5kZXhlcyA9IGVkaXRvci5saXN0U2VsZWN0aW9ucygpLm1hcCgoc2VsZWN0aW9uKSA9PiB7XG4gICAgICBjb25zdCB7IGZyb20gfSA9IGdldFNlbGVjdGlvbkJvdW5kYXJpZXMoc2VsZWN0aW9uKTtcbiAgICAgIHJldHVybiBlZGl0b3IucG9zVG9PZmZzZXQoZnJvbSk7XG4gICAgfSk7XG4gICAgZm9yIChjb25zdCBtYXRjaCBvZiBtYXRjaGVzKSB7XG4gICAgICBpZiAoIXNlbGVjdGlvbkluZGV4ZXMuaW5jbHVkZXMobWF0Y2guaW5kZXgpKSB7XG4gICAgICAgIG5leHRNYXRjaCA9IHtcbiAgICAgICAgICBhbmNob3I6IGVkaXRvci5vZmZzZXRUb1BvcyhtYXRjaC5pbmRleCksXG4gICAgICAgICAgaGVhZDogZWRpdG9yLm9mZnNldFRvUG9zKG1hdGNoLmluZGV4ICsgc2VhcmNoVGV4dC5sZW5ndGgpLFxuICAgICAgICB9O1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICByZXR1cm4gbmV4dE1hdGNoO1xufTtcblxuZXhwb3J0IGNvbnN0IGZpbmRBbGxNYXRjaFBvc2l0aW9ucyA9ICh7XG4gIGVkaXRvcixcbiAgc2VhcmNoVGV4dCxcbiAgc2VhcmNoV2l0aGluV29yZHMsXG4gIGRvY3VtZW50Q29udGVudCxcbn06IHtcbiAgZWRpdG9yOiBFZGl0b3I7XG4gIHNlYXJjaFRleHQ6IHN0cmluZztcbiAgc2VhcmNoV2l0aGluV29yZHM6IGJvb2xlYW47XG4gIGRvY3VtZW50Q29udGVudDogc3RyaW5nO1xufSkgPT4ge1xuICBjb25zdCBtYXRjaGVzID0gZmluZEFsbE1hdGNoZXMoe1xuICAgIHNlYXJjaFRleHQsXG4gICAgc2VhcmNoV2l0aGluV29yZHMsXG4gICAgZG9jdW1lbnRDb250ZW50LFxuICB9KTtcbiAgY29uc3QgbWF0Y2hQb3NpdGlvbnMgPSBbXTtcbiAgZm9yIChjb25zdCBtYXRjaCBvZiBtYXRjaGVzKSB7XG4gICAgbWF0Y2hQb3NpdGlvbnMucHVzaCh7XG4gICAgICBhbmNob3I6IGVkaXRvci5vZmZzZXRUb1BvcyhtYXRjaC5pbmRleCksXG4gICAgICBoZWFkOiBlZGl0b3Iub2Zmc2V0VG9Qb3MobWF0Y2guaW5kZXggKyBzZWFyY2hUZXh0Lmxlbmd0aCksXG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIG1hdGNoUG9zaXRpb25zO1xufTtcblxuZXhwb3J0IGNvbnN0IHRvVGl0bGVDYXNlID0gKHNlbGVjdGVkVGV4dDogc3RyaW5nKSA9PiB7XG4gIC8vIHVzZSBjYXB0dXJlIGdyb3VwIHRvIGpvaW4gd2l0aCB0aGUgc2FtZSBzZXBhcmF0b3IgdXNlZCB0byBzcGxpdFxuICByZXR1cm4gc2VsZWN0ZWRUZXh0XG4gICAgLnNwbGl0KC8oXFxzKykvKVxuICAgIC5tYXAoKHdvcmQsIGluZGV4LCBhbGxXb3JkcykgPT4ge1xuICAgICAgaWYgKFxuICAgICAgICBpbmRleCA+IDAgJiZcbiAgICAgICAgaW5kZXggPCBhbGxXb3Jkcy5sZW5ndGggLSAxICYmXG4gICAgICAgIExPV0VSQ0FTRV9BUlRJQ0xFUy5pbmNsdWRlcyh3b3JkLnRvTG93ZXJDYXNlKCkpXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIHdvcmQudG9Mb3dlckNhc2UoKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB3b3JkLmNoYXJBdCgwKS50b1VwcGVyQ2FzZSgpICsgd29yZC5zdWJzdHJpbmcoMSkudG9Mb3dlckNhc2UoKTtcbiAgICB9KVxuICAgIC5qb2luKCcnKTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXROZXh0Q2FzZSA9IChzZWxlY3RlZFRleHQ6IHN0cmluZyk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IHRleHRVcHBlciA9IHNlbGVjdGVkVGV4dC50b1VwcGVyQ2FzZSgpO1xuICBjb25zdCB0ZXh0TG93ZXIgPSBzZWxlY3RlZFRleHQudG9Mb3dlckNhc2UoKTtcbiAgY29uc3QgdGV4dFRpdGxlID0gdG9UaXRsZUNhc2Uoc2VsZWN0ZWRUZXh0KTtcblxuICBzd2l0Y2ggKHNlbGVjdGVkVGV4dCkge1xuICAgIGNhc2UgdGV4dFVwcGVyOiB7XG4gICAgICByZXR1cm4gdGV4dExvd2VyO1xuICAgIH1cbiAgICBjYXNlIHRleHRMb3dlcjoge1xuICAgICAgcmV0dXJuIHRleHRUaXRsZTtcbiAgICB9XG4gICAgY2FzZSB0ZXh0VGl0bGU6IHtcbiAgICAgIHJldHVybiB0ZXh0VXBwZXI7XG4gICAgfVxuICAgIGRlZmF1bHQ6IHtcbiAgICAgIHJldHVybiB0ZXh0VXBwZXI7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIENoZWNrcyBpZiBhbiBpbnB1dCBzdHJpbmcgaXMgbnVtZXJpYy5cbiAqXG4gKiBBZGFwdGVkIGZyb20gaHR0cHM6Ly9zdGFja292ZXJmbG93LmNvbS9hLzYwNTQ4MTE5XG4gKi9cbmV4cG9ydCBjb25zdCBpc051bWVyaWMgPSAoaW5wdXQ6IHN0cmluZykgPT4gaW5wdXQubGVuZ3RoID4gMCAmJiAhaXNOYU4oK2lucHV0KTtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHRoZSBuZXh0IG1hcmtkb3duIGxpc3QgY2hhcmFjdGVyIHByZWZpeCBmb3IgYSBnaXZlbiBsaW5lLlxuICpcbiAqIElmIGl0J3MgYW4gb3JkZXJlZCBsaXN0IGFuZCBkaXJlY3Rpb24gaXMgYGFmdGVyYCwgdGhlIHByZWZpeCB3aWxsIGJlXG4gKiBpbmNyZW1lbnRlZCBieSAxLlxuICpcbiAqIElmIGl0J3MgYSBjaGVja2xpc3QsIHRoZSBuZXdseSBpbnNlcnRlZCBjaGVja2JveCB3aWxsIGFsd2F5cyBiZSB1bnRpY2tlZC5cbiAqXG4gKiBJZiB0aGUgY3VycmVudCBsaXN0IGl0ZW0gaXMgZW1wdHksIHRoaXMgd2lsbCBiZSBpbmRpY2F0ZWQgYnkgYSBgbnVsbGAgcHJlZml4LlxuICovXG5leHBvcnQgY29uc3QgZ2V0TmV4dExpc3RQcmVmaXggPSAoXG4gIHRleHQ6IHN0cmluZyxcbiAgZGlyZWN0aW9uOiAnYmVmb3JlJyB8ICdhZnRlcicsXG4pOiBzdHJpbmcgfCBudWxsID0+IHtcbiAgY29uc3QgbGlzdENoYXJzID0gdGV4dC5tYXRjaChMSVNUX0NIQVJBQ1RFUl9SRUdFWCk7XG4gIGlmIChsaXN0Q2hhcnMgJiYgbGlzdENoYXJzLmxlbmd0aCA+IDApIHtcbiAgICBsZXQgcHJlZml4ID0gbGlzdENoYXJzWzBdLnRyaW1TdGFydCgpO1xuICAgIGNvbnN0IGlzRW1wdHlMaXN0SXRlbSA9IHByZWZpeCA9PT0gbGlzdENoYXJzLmlucHV0LnRyaW1TdGFydCgpO1xuICAgIGlmIChpc0VtcHR5TGlzdEl0ZW0pIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBpZiAoaXNOdW1lcmljKHByZWZpeCkgJiYgZGlyZWN0aW9uID09PSAnYWZ0ZXInKSB7XG4gICAgICBwcmVmaXggPSArcHJlZml4ICsgMSArICcuICc7XG4gICAgfVxuICAgIGlmIChwcmVmaXguc3RhcnRzV2l0aCgnLSBbJykgJiYgIXByZWZpeC5pbmNsdWRlcygnWyBdJykpIHtcbiAgICAgIHByZWZpeCA9ICctIFsgXSAnO1xuICAgIH1cbiAgICByZXR1cm4gcHJlZml4O1xuICB9XG4gIHJldHVybiAnJztcbn07XG5cbmV4cG9ydCBjb25zdCBmb3JtYXRSZW1haW5pbmdMaXN0UHJlZml4ZXMgPSAoXG4gIGVkaXRvcjogRWRpdG9yLFxuICBmcm9tTGluZTogbnVtYmVyLFxuICBpbmRlbnRhdGlvbjogc3RyaW5nLFxuKSA9PiB7XG4gIGNvbnN0IGNoYW5nZXM6IEVkaXRvckNoYW5nZVtdID0gW107XG5cbiAgZm9yIChsZXQgaSA9IGZyb21MaW5lOyBpIDwgZWRpdG9yLmxpbmVDb3VudCgpOyBpKyspIHtcbiAgICBjb25zdCBjb250ZW50c09mQ3VycmVudExpbmUgPSBlZGl0b3IuZ2V0TGluZShpKTtcbiAgICAvLyBPbmx5IHByZWZpeGVzIGF0IHRoZSBzYW1lIGluZGVudGF0aW9uIGxldmVsIHNob3VsZCBiZSB1cGRhdGVkXG4gICAgY29uc3QgbGlzdFByZWZpeFJlZ2V4ID0gbmV3IFJlZ0V4cChgXiR7aW5kZW50YXRpb259XFxcXGQrXFxcXC5gKTtcbiAgICBjb25zdCBsaW5lU3RhcnRzV2l0aE51bWJlclByZWZpeCA9IGxpc3RQcmVmaXhSZWdleC50ZXN0KFxuICAgICAgY29udGVudHNPZkN1cnJlbnRMaW5lLFxuICAgICk7XG4gICAgaWYgKCFsaW5lU3RhcnRzV2l0aE51bWJlclByZWZpeCkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNvbnN0IHJlcGxhY2VtZW50Q29udGVudCA9IGNvbnRlbnRzT2ZDdXJyZW50TGluZS5yZXBsYWNlKFxuICAgICAgL1xcZCtcXC4vLFxuICAgICAgKG1hdGNoKSA9PiArbWF0Y2ggKyAxICsgJy4nLFxuICAgICk7XG4gICAgY2hhbmdlcy5wdXNoKHtcbiAgICAgIGZyb206IHsgbGluZTogaSwgY2g6IDAgfSxcbiAgICAgIHRvOiB7IGxpbmU6IGksIGNoOiBjb250ZW50c09mQ3VycmVudExpbmUubGVuZ3RoIH0sXG4gICAgICB0ZXh0OiByZXBsYWNlbWVudENvbnRlbnQsXG4gICAgfSk7XG4gIH1cblxuICBpZiAoY2hhbmdlcy5sZW5ndGggPiAwKSB7XG4gICAgZWRpdG9yLnRyYW5zYWN0aW9uKHsgY2hhbmdlcyB9KTtcbiAgfVxufTtcblxudHlwZSBWYXVsdENvbmZpZ1NldHRpbmcgPSAnc2hvd0xpbmVOdW1iZXInIHwgJ3VzZVRhYic7XG5cbmV4cG9ydCBjb25zdCB0b2dnbGVWYXVsdENvbmZpZyA9IChhcHA6IEFwcCwgc2V0dGluZzogVmF1bHRDb25maWdTZXR0aW5nKSA9PiB7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBnZXRDb25maWcgaXMgbm90IGluIHRoZSBwdWJsaWMgQVBJXG4gIGNvbnN0IHZhbHVlID0gYXBwLnZhdWx0LmdldENvbmZpZyhzZXR0aW5nKTtcbiAgc2V0VmF1bHRDb25maWcoYXBwLCBzZXR0aW5nLCAhdmFsdWUpO1xufTtcblxuZXhwb3J0IGNvbnN0IHNldFZhdWx0Q29uZmlnID0gKFxuICBhcHA6IEFwcCxcbiAgc2V0dGluZzogVmF1bHRDb25maWdTZXR0aW5nLFxuICB2YWx1ZTogYm9vbGVhbixcbikgPT4ge1xuICAvLyBAdHMtZXhwZWN0LWVycm9yIC0gc2V0Q29uZmlnIGlzIG5vdCBpbiB0aGUgcHVibGljIEFQSVxuICBhcHAudmF1bHQuc2V0Q29uZmlnKHNldHRpbmcsIHZhbHVlKTtcbn07XG4iLCAiaW1wb3J0IHR5cGUge1xuICBBcHAsXG4gIEVkaXRvcixcbiAgRWRpdG9yQ2hhbmdlLFxuICBFZGl0b3JQb3NpdGlvbixcbiAgRWRpdG9yU2VsZWN0aW9uLFxufSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQge1xuICBDQVNFLFxuICBTRUFSQ0hfRElSRUNUSU9OLFxuICBNQVRDSElOR19CUkFDS0VUUyxcbiAgTUFUQ0hJTkdfUVVPVEVTLFxuICBNQVRDSElOR19RVU9URVNfQlJBQ0tFVFMsXG4gIE1hdGNoaW5nQ2hhcmFjdGVyTWFwLFxuICBDT0RFX0VESVRPUixcbiAgTElTVF9DSEFSQUNURVJfUkVHRVgsXG59IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IFNldHRpbmdzU3RhdGUgfSBmcm9tICcuL3N0YXRlJztcbmltcG9ydCB7XG4gIENoZWNrQ2hhcmFjdGVyLFxuICBFZGl0b3JBY3Rpb25DYWxsYmFja05ld0FyZ3MsXG4gIGZpbmRBbGxNYXRjaFBvc2l0aW9ucyxcbiAgZmluZE5leHRNYXRjaFBvc2l0aW9uLFxuICBmaW5kUG9zT2ZOZXh0Q2hhcmFjdGVyLFxuICBmb3JtYXRSZW1haW5pbmdMaXN0UHJlZml4ZXMsXG4gIGdldExlYWRpbmdXaGl0ZXNwYWNlLFxuICBnZXRMaW5lRW5kUG9zLFxuICBnZXRMaW5lU3RhcnRQb3MsXG4gIGdldE5leHRDYXNlLFxuICB0b1RpdGxlQ2FzZSxcbiAgZ2V0U2VsZWN0aW9uQm91bmRhcmllcyxcbiAgd29yZFJhbmdlQXRQb3MsXG4gIGdldFNlYXJjaFRleHQsXG4gIGdldE5leHRMaXN0UHJlZml4LFxuICBpc051bWVyaWMsXG59IGZyb20gJy4vdXRpbHMnO1xuXG5leHBvcnQgY29uc3QgaW5zZXJ0TGluZUFib3ZlID0gKFxuICBlZGl0b3I6IEVkaXRvcixcbiAgc2VsZWN0aW9uOiBFZGl0b3JTZWxlY3Rpb24sXG4gIGFyZ3M6IEVkaXRvckFjdGlvbkNhbGxiYWNrTmV3QXJncyxcbikgPT4ge1xuICBjb25zdCB7IGxpbmUgfSA9IHNlbGVjdGlvbi5oZWFkO1xuICBjb25zdCBzdGFydE9mQ3VycmVudExpbmUgPSBnZXRMaW5lU3RhcnRQb3MobGluZSk7XG5cbiAgY29uc3QgY29udGVudHNPZkN1cnJlbnRMaW5lID0gZWRpdG9yLmdldExpbmUobGluZSk7XG4gIGNvbnN0IGluZGVudGF0aW9uID0gZ2V0TGVhZGluZ1doaXRlc3BhY2UoY29udGVudHNPZkN1cnJlbnRMaW5lKTtcblxuICBsZXQgbGlzdFByZWZpeCA9ICcnO1xuICBpZiAoXG4gICAgU2V0dGluZ3NTdGF0ZS5hdXRvSW5zZXJ0TGlzdFByZWZpeCAmJlxuICAgIGxpbmUgPiAwICYmXG4gICAgLy8gSWYgaW5zaWRlIGEgbGlzdCwgb25seSBpbnNlcnQgcHJlZml4IGlmIHdpdGhpbiB0aGUgc2FtZSBsaXN0XG4gICAgZWRpdG9yLmdldExpbmUobGluZSAtIDEpLnRyaW0oKS5sZW5ndGggPiAwXG4gICkge1xuICAgIGxpc3RQcmVmaXggPSBnZXROZXh0TGlzdFByZWZpeChjb250ZW50c09mQ3VycmVudExpbmUsICdiZWZvcmUnKTtcbiAgICBpZiAoaXNOdW1lcmljKGxpc3RQcmVmaXgpKSB7XG4gICAgICBmb3JtYXRSZW1haW5pbmdMaXN0UHJlZml4ZXMoZWRpdG9yLCBsaW5lLCBpbmRlbnRhdGlvbik7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgY2hhbmdlczogRWRpdG9yQ2hhbmdlW10gPSBbXG4gICAgeyBmcm9tOiBzdGFydE9mQ3VycmVudExpbmUsIHRleHQ6IGluZGVudGF0aW9uICsgbGlzdFByZWZpeCArICdcXG4nIH0sXG4gIF07XG4gIGNvbnN0IG5ld1NlbGVjdGlvbiA9IHtcbiAgICBmcm9tOiB7XG4gICAgICAuLi5zdGFydE9mQ3VycmVudExpbmUsXG4gICAgICAvLyBPZmZzZXQgYnkgaXRlcmF0aW9uXG4gICAgICBsaW5lOiBzdGFydE9mQ3VycmVudExpbmUubGluZSArIGFyZ3MuaXRlcmF0aW9uLFxuICAgICAgY2g6IGluZGVudGF0aW9uLmxlbmd0aCArIGxpc3RQcmVmaXgubGVuZ3RoLFxuICAgIH0sXG4gIH07XG4gIHJldHVybiB7XG4gICAgY2hhbmdlcyxcbiAgICBuZXdTZWxlY3Rpb24sXG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgaW5zZXJ0TGluZUJlbG93ID0gKFxuICBlZGl0b3I6IEVkaXRvcixcbiAgc2VsZWN0aW9uOiBFZGl0b3JTZWxlY3Rpb24sXG4gIGFyZ3M6IEVkaXRvckFjdGlvbkNhbGxiYWNrTmV3QXJncyxcbikgPT4ge1xuICBjb25zdCB7IGxpbmUgfSA9IHNlbGVjdGlvbi5oZWFkO1xuICBjb25zdCBzdGFydE9mQ3VycmVudExpbmUgPSBnZXRMaW5lU3RhcnRQb3MobGluZSk7XG4gIGNvbnN0IGVuZE9mQ3VycmVudExpbmUgPSBnZXRMaW5lRW5kUG9zKGxpbmUsIGVkaXRvcik7XG5cbiAgY29uc3QgY29udGVudHNPZkN1cnJlbnRMaW5lID0gZWRpdG9yLmdldExpbmUobGluZSk7XG4gIGNvbnN0IGluZGVudGF0aW9uID0gZ2V0TGVhZGluZ1doaXRlc3BhY2UoY29udGVudHNPZkN1cnJlbnRMaW5lKTtcblxuICBsZXQgbGlzdFByZWZpeCA9ICcnO1xuICBpZiAoU2V0dGluZ3NTdGF0ZS5hdXRvSW5zZXJ0TGlzdFByZWZpeCkge1xuICAgIGxpc3RQcmVmaXggPSBnZXROZXh0TGlzdFByZWZpeChjb250ZW50c09mQ3VycmVudExpbmUsICdhZnRlcicpO1xuXG4gICAgLy8gUGVyZm9ybWluZyB0aGlzIGFjdGlvbiBvbiBhbiBlbXB0eSBsaXN0IGl0ZW0gc2hvdWxkIGRlbGV0ZSBpdFxuICAgIGlmIChsaXN0UHJlZml4ID09PSBudWxsKSB7XG4gICAgICBjb25zdCBjaGFuZ2VzOiBFZGl0b3JDaGFuZ2VbXSA9IFtcbiAgICAgICAgeyBmcm9tOiBzdGFydE9mQ3VycmVudExpbmUsIHRvOiBlbmRPZkN1cnJlbnRMaW5lLCB0ZXh0OiAnJyB9LFxuICAgICAgXTtcbiAgICAgIGNvbnN0IG5ld1NlbGVjdGlvbiA9IHtcbiAgICAgICAgZnJvbToge1xuICAgICAgICAgIGxpbmUsXG4gICAgICAgICAgY2g6IDAsXG4gICAgICAgIH0sXG4gICAgICB9O1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgY2hhbmdlcyxcbiAgICAgICAgbmV3U2VsZWN0aW9uLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAoaXNOdW1lcmljKGxpc3RQcmVmaXgpKSB7XG4gICAgICBmb3JtYXRSZW1haW5pbmdMaXN0UHJlZml4ZXMoZWRpdG9yLCBsaW5lICsgMSwgaW5kZW50YXRpb24pO1xuICAgIH1cbiAgfVxuXG4gIGNvbnN0IGNoYW5nZXM6IEVkaXRvckNoYW5nZVtdID0gW1xuICAgIHsgZnJvbTogZW5kT2ZDdXJyZW50TGluZSwgdGV4dDogJ1xcbicgKyBpbmRlbnRhdGlvbiArIGxpc3RQcmVmaXggfSxcbiAgXTtcbiAgY29uc3QgbmV3U2VsZWN0aW9uID0ge1xuICAgIGZyb206IHtcbiAgICAgIC8vIE9mZnNldCBieSBpdGVyYXRpb25cbiAgICAgIGxpbmU6IGxpbmUgKyAxICsgYXJncy5pdGVyYXRpb24sXG4gICAgICBjaDogaW5kZW50YXRpb24ubGVuZ3RoICsgbGlzdFByZWZpeC5sZW5ndGgsXG4gICAgfSxcbiAgfTtcbiAgcmV0dXJuIHtcbiAgICBjaGFuZ2VzLFxuICAgIG5ld1NlbGVjdGlvbixcbiAgfTtcbn07XG5cbi8vIE5vdGU6IGRvbid0IHVzZSB0aGUgYnVpbHQtaW4gZXhlYyBtZXRob2QgZm9yICdkZWxldGVMaW5lJyBhcyB0aGVyZSBpcyBhIGJ1Z1xuLy8gd2hlcmUgcnVubmluZyBpdCBvbiBhIGxpbmUgdGhhdCBpcyBsb25nIGVub3VnaCB0byBiZSB3cmFwcGVkIHdpbGwgZm9jdXMgb25cbi8vIHRoZSBwcmV2aW91cyBsaW5lIGluc3RlYWQgb2YgdGhlIG5leHQgbGluZSBhZnRlciBkZWxldGlvblxubGV0IG51bUxpbmVzRGVsZXRlZCA9IDA7XG5leHBvcnQgY29uc3QgZGVsZXRlTGluZSA9IChcbiAgZWRpdG9yOiBFZGl0b3IsXG4gIHNlbGVjdGlvbjogRWRpdG9yU2VsZWN0aW9uLFxuICBhcmdzOiBFZGl0b3JBY3Rpb25DYWxsYmFja05ld0FyZ3MsXG4pID0+IHtcbiAgY29uc3QgeyBmcm9tLCB0bywgaGFzVHJhaWxpbmdOZXdsaW5lIH0gPSBnZXRTZWxlY3Rpb25Cb3VuZGFyaWVzKHNlbGVjdGlvbik7XG5cbiAgaWYgKHRvLmxpbmUgPT09IGVkaXRvci5sYXN0TGluZSgpKSB7XG4gICAgLy8gVGhlcmUgaXMgbm8gJ25leHQgbGluZScgd2hlbiBjdXJzb3IgaXMgb24gdGhlIGxhc3QgbGluZVxuICAgIGNvbnN0IHByZXZpb3VzTGluZSA9IE1hdGgubWF4KDAsIGZyb20ubGluZSAtIDEpO1xuICAgIGNvbnN0IGVuZE9mUHJldmlvdXNMaW5lID0gZ2V0TGluZUVuZFBvcyhwcmV2aW91c0xpbmUsIGVkaXRvcik7XG4gICAgY29uc3QgY2hhbmdlczogRWRpdG9yQ2hhbmdlW10gPSBbXG4gICAgICB7XG4gICAgICAgIGZyb206IGZyb20ubGluZSA9PT0gMCA/IGdldExpbmVTdGFydFBvcygwKSA6IGVuZE9mUHJldmlvdXNMaW5lLFxuICAgICAgICB0bzpcbiAgICAgICAgICAvLyBFeGNsdWRlIGxpbmUgc3RhcnRpbmcgYXQgdHJhaWxpbmcgbmV3bGluZSBhdCBlbmQgb2YgZG9jdW1lbnQgZnJvbSBiZWluZyBkZWxldGVkXG4gICAgICAgICAgdG8uY2ggPT09IDBcbiAgICAgICAgICAgID8gZ2V0TGluZVN0YXJ0UG9zKHRvLmxpbmUpXG4gICAgICAgICAgICA6IGdldExpbmVFbmRQb3ModG8ubGluZSwgZWRpdG9yKSxcbiAgICAgICAgdGV4dDogJycsXG4gICAgICB9LFxuICAgIF07XG4gICAgY29uc3QgbmV3U2VsZWN0aW9uID0ge1xuICAgICAgZnJvbToge1xuICAgICAgICBsaW5lOiBwcmV2aW91c0xpbmUsXG4gICAgICAgIGNoOiBNYXRoLm1pbihmcm9tLmNoLCBlbmRPZlByZXZpb3VzTGluZS5jaCksXG4gICAgICB9LFxuICAgIH07XG4gICAgcmV0dXJuIHtcbiAgICAgIGNoYW5nZXMsXG4gICAgICBuZXdTZWxlY3Rpb24sXG4gICAgfTtcbiAgfVxuXG4gIC8vIFJlc2V0IG9mZnNldCBhdCB0aGUgc3RhcnQgb2YgYSBuZXcgYnVsayBkZWxldGUgb3BlcmF0aW9uXG4gIGlmIChhcmdzLml0ZXJhdGlvbiA9PT0gMCkge1xuICAgIG51bUxpbmVzRGVsZXRlZCA9IDA7XG4gIH1cbiAgLy8gRXhjbHVkZSBsaW5lIHN0YXJ0aW5nIGF0IHRyYWlsaW5nIG5ld2xpbmUgZnJvbSBiZWluZyBkZWxldGVkXG4gIGNvbnN0IHRvTGluZSA9IGhhc1RyYWlsaW5nTmV3bGluZSA/IHRvLmxpbmUgLSAxIDogdG8ubGluZTtcbiAgY29uc3QgZW5kT2ZOZXh0TGluZSA9IGdldExpbmVFbmRQb3ModG9MaW5lICsgMSwgZWRpdG9yKTtcbiAgY29uc3QgY2hhbmdlczogRWRpdG9yQ2hhbmdlW10gPSBbXG4gICAge1xuICAgICAgZnJvbTogZ2V0TGluZVN0YXJ0UG9zKGZyb20ubGluZSksXG4gICAgICB0bzogZ2V0TGluZVN0YXJ0UG9zKHRvTGluZSArIDEpLFxuICAgICAgdGV4dDogJycsXG4gICAgfSxcbiAgXTtcbiAgY29uc3QgbmV3U2VsZWN0aW9uID0ge1xuICAgIGZyb206IHtcbiAgICAgIC8vIE9mZnNldCBieSB0aGUgbnVtYmVyIG9mIGxpbmVzIGRlbGV0ZWQgaW4gYWxsIHByZXZpb3VzIGl0ZXJhdGlvbnNcbiAgICAgIGxpbmU6IGZyb20ubGluZSAtIG51bUxpbmVzRGVsZXRlZCxcbiAgICAgIGNoOiBNYXRoLm1pbih0by5jaCwgZW5kT2ZOZXh0TGluZS5jaCksXG4gICAgfSxcbiAgfTtcbiAgLy8gVGhpcyBuZWVkcyB0byBiZSBjYWxjdWxhdGVkIGFmdGVyIHNldHRpbmcgdGhlIG5ldyBzZWxlY3Rpb24gYXMgaXQgb25seVxuICAvLyBhcHBsaWVzIGZvciBzdWJzZXF1ZW50IGl0ZXJhdGlvbnNcbiAgbnVtTGluZXNEZWxldGVkICs9IHRvTGluZSAtIGZyb20ubGluZSArIDE7XG4gIHJldHVybiB7XG4gICAgY2hhbmdlcyxcbiAgICBuZXdTZWxlY3Rpb24sXG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgZGVsZXRlVG9TdGFydE9mTGluZSA9IChcbiAgZWRpdG9yOiBFZGl0b3IsXG4gIHNlbGVjdGlvbjogRWRpdG9yU2VsZWN0aW9uLFxuKSA9PiB7XG4gIGNvbnN0IHBvcyA9IHNlbGVjdGlvbi5oZWFkO1xuICBsZXQgc3RhcnRQb3MgPSBnZXRMaW5lU3RhcnRQb3MocG9zLmxpbmUpO1xuXG4gIGlmIChwb3MubGluZSA9PT0gMCAmJiBwb3MuY2ggPT09IDApIHtcbiAgICAvLyBXZSdyZSBhdCB0aGUgc3RhcnQgb2YgdGhlIGRvY3VtZW50IHNvIGRvIG5vdGhpbmdcbiAgICByZXR1cm4gc2VsZWN0aW9uO1xuICB9XG5cbiAgaWYgKHBvcy5saW5lID09PSBzdGFydFBvcy5saW5lICYmIHBvcy5jaCA9PT0gc3RhcnRQb3MuY2gpIHtcbiAgICAvLyBXZSdyZSBhdCB0aGUgc3RhcnQgb2YgdGhlIGxpbmUgc28gZGVsZXRlIHRoZSBwcmVjZWRpbmcgbmV3bGluZVxuICAgIHN0YXJ0UG9zID0gZ2V0TGluZUVuZFBvcyhwb3MubGluZSAtIDEsIGVkaXRvcik7XG4gIH1cblxuICBlZGl0b3IucmVwbGFjZVJhbmdlKCcnLCBzdGFydFBvcywgcG9zKTtcbiAgcmV0dXJuIHtcbiAgICBhbmNob3I6IHN0YXJ0UG9zLFxuICB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGRlbGV0ZVRvRW5kT2ZMaW5lID0gKFxuICBlZGl0b3I6IEVkaXRvcixcbiAgc2VsZWN0aW9uOiBFZGl0b3JTZWxlY3Rpb24sXG4pID0+IHtcbiAgY29uc3QgcG9zID0gc2VsZWN0aW9uLmhlYWQ7XG4gIGxldCBlbmRQb3MgPSBnZXRMaW5lRW5kUG9zKHBvcy5saW5lLCBlZGl0b3IpO1xuXG4gIGlmIChwb3MubGluZSA9PT0gZW5kUG9zLmxpbmUgJiYgcG9zLmNoID09PSBlbmRQb3MuY2gpIHtcbiAgICAvLyBXZSdyZSBhdCB0aGUgZW5kIG9mIHRoZSBsaW5lIHNvIGRlbGV0ZSBqdXN0IHRoZSBuZXdsaW5lXG4gICAgZW5kUG9zID0gZ2V0TGluZVN0YXJ0UG9zKHBvcy5saW5lICsgMSk7XG4gIH1cblxuICBlZGl0b3IucmVwbGFjZVJhbmdlKCcnLCBwb3MsIGVuZFBvcyk7XG4gIHJldHVybiB7XG4gICAgYW5jaG9yOiBwb3MsXG4gIH07XG59O1xuXG5leHBvcnQgY29uc3Qgam9pbkxpbmVzID0gKGVkaXRvcjogRWRpdG9yLCBzZWxlY3Rpb246IEVkaXRvclNlbGVjdGlvbikgPT4ge1xuICBjb25zdCB7IGZyb20sIHRvIH0gPSBnZXRTZWxlY3Rpb25Cb3VuZGFyaWVzKHNlbGVjdGlvbik7XG4gIGNvbnN0IHsgbGluZSB9ID0gZnJvbTtcblxuICBsZXQgZW5kT2ZDdXJyZW50TGluZSA9IGdldExpbmVFbmRQb3MobGluZSwgZWRpdG9yKTtcbiAgY29uc3Qgam9pblJhbmdlTGltaXQgPSBNYXRoLm1heCh0by5saW5lIC0gbGluZSwgMSk7XG4gIGNvbnN0IHNlbGVjdGlvbkxlbmd0aCA9IGVkaXRvci5wb3NUb09mZnNldCh0bykgLSBlZGl0b3IucG9zVG9PZmZzZXQoZnJvbSk7XG4gIGxldCB0cmltbWVkQ2hhcnMgPSAnJztcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IGpvaW5SYW5nZUxpbWl0OyBpKyspIHtcbiAgICBpZiAobGluZSA9PT0gZWRpdG9yLmxpbmVDb3VudCgpIC0gMSkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGVuZE9mQ3VycmVudExpbmUgPSBnZXRMaW5lRW5kUG9zKGxpbmUsIGVkaXRvcik7XG4gICAgY29uc3QgZW5kT2ZOZXh0TGluZSA9IGdldExpbmVFbmRQb3MobGluZSArIDEsIGVkaXRvcik7XG4gICAgY29uc3QgY29udGVudHNPZkN1cnJlbnRMaW5lID0gZWRpdG9yLmdldExpbmUobGluZSk7XG4gICAgY29uc3QgY29udGVudHNPZk5leHRMaW5lID0gZWRpdG9yLmdldExpbmUobGluZSArIDEpO1xuXG4gICAgY29uc3QgY2hhcnNUb1RyaW0gPSBjb250ZW50c09mTmV4dExpbmUubWF0Y2goTElTVF9DSEFSQUNURVJfUkVHRVgpID8/IFtdO1xuICAgIHRyaW1tZWRDaGFycyArPSBjaGFyc1RvVHJpbVswXSA/PyAnJztcblxuICAgIGNvbnN0IG5ld0NvbnRlbnRzT2ZOZXh0TGluZSA9IGNvbnRlbnRzT2ZOZXh0TGluZS5yZXBsYWNlKFxuICAgICAgTElTVF9DSEFSQUNURVJfUkVHRVgsXG4gICAgICAnJyxcbiAgICApO1xuICAgIGlmIChcbiAgICAgIG5ld0NvbnRlbnRzT2ZOZXh0TGluZS5sZW5ndGggPiAwICYmXG4gICAgICBjb250ZW50c09mQ3VycmVudExpbmUuY2hhckF0KGVuZE9mQ3VycmVudExpbmUuY2ggLSAxKSAhPT0gJyAnXG4gICAgKSB7XG4gICAgICBlZGl0b3IucmVwbGFjZVJhbmdlKFxuICAgICAgICAnICcgKyBuZXdDb250ZW50c09mTmV4dExpbmUsXG4gICAgICAgIGVuZE9mQ3VycmVudExpbmUsXG4gICAgICAgIGVuZE9mTmV4dExpbmUsXG4gICAgICApO1xuICAgIH0gZWxzZSB7XG4gICAgICBlZGl0b3IucmVwbGFjZVJhbmdlKFxuICAgICAgICBuZXdDb250ZW50c09mTmV4dExpbmUsXG4gICAgICAgIGVuZE9mQ3VycmVudExpbmUsXG4gICAgICAgIGVuZE9mTmV4dExpbmUsXG4gICAgICApO1xuICAgIH1cbiAgfVxuXG4gIGlmIChzZWxlY3Rpb25MZW5ndGggPT09IDApIHtcbiAgICByZXR1cm4ge1xuICAgICAgYW5jaG9yOiBlbmRPZkN1cnJlbnRMaW5lLFxuICAgIH07XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBhbmNob3I6IGZyb20sXG4gICAgaGVhZDoge1xuICAgICAgbGluZTogZnJvbS5saW5lLFxuICAgICAgY2g6IGZyb20uY2ggKyBzZWxlY3Rpb25MZW5ndGggLSB0cmltbWVkQ2hhcnMubGVuZ3RoLFxuICAgIH0sXG4gIH07XG59O1xuXG5leHBvcnQgY29uc3QgY29weUxpbmUgPSAoXG4gIGVkaXRvcjogRWRpdG9yLFxuICBzZWxlY3Rpb246IEVkaXRvclNlbGVjdGlvbixcbiAgZGlyZWN0aW9uOiAndXAnIHwgJ2Rvd24nLFxuKSA9PiB7XG4gIGNvbnN0IHsgZnJvbSwgdG8sIGhhc1RyYWlsaW5nTmV3bGluZSB9ID0gZ2V0U2VsZWN0aW9uQm91bmRhcmllcyhzZWxlY3Rpb24pO1xuICBjb25zdCBmcm9tTGluZVN0YXJ0ID0gZ2V0TGluZVN0YXJ0UG9zKGZyb20ubGluZSk7XG4gIC8vIEV4Y2x1ZGUgbGluZSBzdGFydGluZyBhdCB0cmFpbGluZyBuZXdsaW5lIGZyb20gYmVpbmcgZHVwbGljYXRlZFxuICBjb25zdCB0b0xpbmUgPSBoYXNUcmFpbGluZ05ld2xpbmUgPyB0by5saW5lIC0gMSA6IHRvLmxpbmU7XG4gIGNvbnN0IHRvTGluZUVuZCA9IGdldExpbmVFbmRQb3ModG9MaW5lLCBlZGl0b3IpO1xuICBjb25zdCBjb250ZW50c09mU2VsZWN0ZWRMaW5lcyA9IGVkaXRvci5nZXRSYW5nZShmcm9tTGluZVN0YXJ0LCB0b0xpbmVFbmQpO1xuICBpZiAoZGlyZWN0aW9uID09PSAndXAnKSB7XG4gICAgZWRpdG9yLnJlcGxhY2VSYW5nZSgnXFxuJyArIGNvbnRlbnRzT2ZTZWxlY3RlZExpbmVzLCB0b0xpbmVFbmQpO1xuICAgIHJldHVybiBzZWxlY3Rpb247XG4gIH0gZWxzZSB7XG4gICAgZWRpdG9yLnJlcGxhY2VSYW5nZShjb250ZW50c09mU2VsZWN0ZWRMaW5lcyArICdcXG4nLCBmcm9tTGluZVN0YXJ0KTtcbiAgICAvLyBUaGlzIHVzZXMgYHRvLmxpbmVgIGluc3RlYWQgb2YgYHRvTGluZWAgdG8gYXZvaWQgYSBkb3VibGUgYWRqdXN0bWVudFxuICAgIGNvbnN0IGxpbmVzU2VsZWN0ZWQgPSB0by5saW5lIC0gZnJvbS5saW5lICsgMTtcbiAgICByZXR1cm4ge1xuICAgICAgYW5jaG9yOiB7IGxpbmU6IHRvTGluZSArIDEsIGNoOiBmcm9tLmNoIH0sXG4gICAgICBoZWFkOiB7IGxpbmU6IHRvTGluZSArIGxpbmVzU2VsZWN0ZWQsIGNoOiB0by5jaCB9LFxuICAgIH07XG4gIH1cbn07XG5cbi8qXG5Qcm9wZXJ0aWVzIHVzZWQgdG8gZGlzdGluZ3Vpc2ggYmV0d2VlbiBzZWxlY3Rpb25zIHRoYXQgYXJlIHByb2dyYW1tYXRpY1xuKGV4cGFuZGluZyBmcm9tIGEgY3Vyc29yIHNlbGVjdGlvbikgdnMuIG1hbnVhbCAodXNpbmcgYSBtb3VzZSAvIFNoaWZ0ICsgYXJyb3dcbmtleXMpLiBUaGlzIGNvbnRyb2xzIHRoZSBtYXRjaCBiZWhhdmlvdXIgZm9yIHNlbGVjdFdvcmRPck5leHRPY2N1cnJlbmNlLlxuKi9cbmxldCBpc01hbnVhbFNlbGVjdGlvbiA9IHRydWU7XG5leHBvcnQgY29uc3Qgc2V0SXNNYW51YWxTZWxlY3Rpb24gPSAodmFsdWU6IGJvb2xlYW4pID0+IHtcbiAgaXNNYW51YWxTZWxlY3Rpb24gPSB2YWx1ZTtcbn07XG5leHBvcnQgbGV0IGlzUHJvZ3JhbW1hdGljU2VsZWN0aW9uQ2hhbmdlID0gZmFsc2U7XG5leHBvcnQgY29uc3Qgc2V0SXNQcm9ncmFtbWF0aWNTZWxlY3Rpb25DaGFuZ2UgPSAodmFsdWU6IGJvb2xlYW4pID0+IHtcbiAgaXNQcm9ncmFtbWF0aWNTZWxlY3Rpb25DaGFuZ2UgPSB2YWx1ZTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZWxlY3RXb3JkT3JOZXh0T2NjdXJyZW5jZSA9IChlZGl0b3I6IEVkaXRvcikgPT4ge1xuICBzZXRJc1Byb2dyYW1tYXRpY1NlbGVjdGlvbkNoYW5nZSh0cnVlKTtcbiAgY29uc3QgYWxsU2VsZWN0aW9ucyA9IGVkaXRvci5saXN0U2VsZWN0aW9ucygpO1xuICBjb25zdCB7IHNlYXJjaFRleHQsIHNpbmdsZVNlYXJjaFRleHQgfSA9IGdldFNlYXJjaFRleHQoe1xuICAgIGVkaXRvcixcbiAgICBhbGxTZWxlY3Rpb25zLFxuICAgIGF1dG9FeHBhbmQ6IGZhbHNlLFxuICB9KTtcblxuICBpZiAoc2VhcmNoVGV4dC5sZW5ndGggPiAwICYmIHNpbmdsZVNlYXJjaFRleHQpIHtcbiAgICBjb25zdCB7IGZyb206IGxhdGVzdE1hdGNoUG9zIH0gPSBnZXRTZWxlY3Rpb25Cb3VuZGFyaWVzKFxuICAgICAgYWxsU2VsZWN0aW9uc1thbGxTZWxlY3Rpb25zLmxlbmd0aCAtIDFdLFxuICAgICk7XG4gICAgY29uc3QgbmV4dE1hdGNoID0gZmluZE5leHRNYXRjaFBvc2l0aW9uKHtcbiAgICAgIGVkaXRvcixcbiAgICAgIGxhdGVzdE1hdGNoUG9zLFxuICAgICAgc2VhcmNoVGV4dCxcbiAgICAgIHNlYXJjaFdpdGhpbldvcmRzOiBpc01hbnVhbFNlbGVjdGlvbixcbiAgICAgIGRvY3VtZW50Q29udGVudDogZWRpdG9yLmdldFZhbHVlKCksXG4gICAgfSk7XG4gICAgY29uc3QgbmV3U2VsZWN0aW9ucyA9IG5leHRNYXRjaFxuICAgICAgPyBhbGxTZWxlY3Rpb25zLmNvbmNhdChuZXh0TWF0Y2gpXG4gICAgICA6IGFsbFNlbGVjdGlvbnM7XG4gICAgZWRpdG9yLnNldFNlbGVjdGlvbnMobmV3U2VsZWN0aW9ucyk7XG4gICAgY29uc3QgbGFzdFNlbGVjdGlvbiA9IG5ld1NlbGVjdGlvbnNbbmV3U2VsZWN0aW9ucy5sZW5ndGggLSAxXTtcbiAgICBlZGl0b3Iuc2Nyb2xsSW50b1ZpZXcoZ2V0U2VsZWN0aW9uQm91bmRhcmllcyhsYXN0U2VsZWN0aW9uKSk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgbmV3U2VsZWN0aW9ucyA9IFtdO1xuICAgIGZvciAoY29uc3Qgc2VsZWN0aW9uIG9mIGFsbFNlbGVjdGlvbnMpIHtcbiAgICAgIGNvbnN0IHsgZnJvbSwgdG8gfSA9IGdldFNlbGVjdGlvbkJvdW5kYXJpZXMoc2VsZWN0aW9uKTtcbiAgICAgIC8vIERvbid0IG1vZGlmeSBleGlzdGluZyByYW5nZSBzZWxlY3Rpb25zXG4gICAgICBpZiAoZnJvbS5saW5lICE9PSB0by5saW5lIHx8IGZyb20uY2ggIT09IHRvLmNoKSB7XG4gICAgICAgIG5ld1NlbGVjdGlvbnMucHVzaChzZWxlY3Rpb24pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbmV3U2VsZWN0aW9ucy5wdXNoKHdvcmRSYW5nZUF0UG9zKGZyb20sIGVkaXRvci5nZXRMaW5lKGZyb20ubGluZSkpKTtcbiAgICAgICAgc2V0SXNNYW51YWxTZWxlY3Rpb24oZmFsc2UpO1xuICAgICAgfVxuICAgIH1cbiAgICBlZGl0b3Iuc2V0U2VsZWN0aW9ucyhuZXdTZWxlY3Rpb25zKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHNlbGVjdEFsbE9jY3VycmVuY2VzID0gKGVkaXRvcjogRWRpdG9yKSA9PiB7XG4gIGNvbnN0IGFsbFNlbGVjdGlvbnMgPSBlZGl0b3IubGlzdFNlbGVjdGlvbnMoKTtcbiAgY29uc3QgeyBzZWFyY2hUZXh0LCBzaW5nbGVTZWFyY2hUZXh0IH0gPSBnZXRTZWFyY2hUZXh0KHtcbiAgICBlZGl0b3IsXG4gICAgYWxsU2VsZWN0aW9ucyxcbiAgICBhdXRvRXhwYW5kOiB0cnVlLFxuICB9KTtcbiAgaWYgKCFzaW5nbGVTZWFyY2hUZXh0KSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IG1hdGNoZXMgPSBmaW5kQWxsTWF0Y2hQb3NpdGlvbnMoe1xuICAgIGVkaXRvcixcbiAgICBzZWFyY2hUZXh0LFxuICAgIHNlYXJjaFdpdGhpbldvcmRzOiB0cnVlLFxuICAgIGRvY3VtZW50Q29udGVudDogZWRpdG9yLmdldFZhbHVlKCksXG4gIH0pO1xuICBlZGl0b3Iuc2V0U2VsZWN0aW9ucyhtYXRjaGVzKTtcbn07XG5cbmV4cG9ydCBjb25zdCBzZWxlY3RMaW5lID0gKF9lZGl0b3I6IEVkaXRvciwgc2VsZWN0aW9uOiBFZGl0b3JTZWxlY3Rpb24pID0+IHtcbiAgY29uc3QgeyBmcm9tLCB0byB9ID0gZ2V0U2VsZWN0aW9uQm91bmRhcmllcyhzZWxlY3Rpb24pO1xuICBjb25zdCBzdGFydE9mQ3VycmVudExpbmUgPSBnZXRMaW5lU3RhcnRQb3MoZnJvbS5saW5lKTtcbiAgLy8gaWYgYSBsaW5lIGlzIGFscmVhZHkgc2VsZWN0ZWQsIGV4cGFuZCB0aGUgc2VsZWN0aW9uIHRvIHRoZSBuZXh0IGxpbmVcbiAgY29uc3Qgc3RhcnRPZk5leHRMaW5lID0gZ2V0TGluZVN0YXJ0UG9zKHRvLmxpbmUgKyAxKTtcbiAgcmV0dXJuIHsgYW5jaG9yOiBzdGFydE9mQ3VycmVudExpbmUsIGhlYWQ6IHN0YXJ0T2ZOZXh0TGluZSB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHNlbGVjdDVMaW5lc0Rvd24gPSAoX2VkaXRvcjogRWRpdG9yLCBzZWxlY3Rpb246IEVkaXRvclNlbGVjdGlvbikgPT4ge1xuICBjb25zdCBuZXdfaGQ6IEVkaXRvclBvc2l0aW9uID0ge2xpbmU6c2VsZWN0aW9uLmhlYWQubGluZSs1LCBjaDpzZWxlY3Rpb24uaGVhZC5jaH07XG4gIHJldHVybiB7IGFuY2hvcjogc2VsZWN0aW9uLmFuY2hvciwgaGVhZDogbmV3X2hkIH07XG59O1xuXG5leHBvcnQgY29uc3Qgc2VsZWN0MTBMaW5lc0Rvd24gPSAoX2VkaXRvcjogRWRpdG9yLCBzZWxlY3Rpb246IEVkaXRvclNlbGVjdGlvbikgPT4ge1xuICBjb25zdCBuZXdfaGQ6IEVkaXRvclBvc2l0aW9uID0ge2xpbmU6c2VsZWN0aW9uLmhlYWQubGluZSsxMCwgY2g6c2VsZWN0aW9uLmhlYWQuY2h9O1xuICByZXR1cm4geyBhbmNob3I6IHNlbGVjdGlvbi5hbmNob3IsIGhlYWQ6IG5ld19oZCB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHNlbGVjdDVMaW5lc1VwID0gKF9lZGl0b3I6IEVkaXRvciwgc2VsZWN0aW9uOiBFZGl0b3JTZWxlY3Rpb24pID0+IHtcbiAgY29uc3QgbmV3X2hkOiBFZGl0b3JQb3NpdGlvbiA9IHtsaW5lOnNlbGVjdGlvbi5oZWFkLmxpbmUtNSwgY2g6c2VsZWN0aW9uLmhlYWQuY2h9O1xuICByZXR1cm4geyBhbmNob3I6IHNlbGVjdGlvbi5hbmNob3IsIGhlYWQ6IG5ld19oZCB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHNlbGVjdDEwTGluZXNVcCA9IChfZWRpdG9yOiBFZGl0b3IsIHNlbGVjdGlvbjogRWRpdG9yU2VsZWN0aW9uKSA9PiB7XG4gIGNvbnN0IG5ld19oZDogRWRpdG9yUG9zaXRpb24gPSB7bGluZTpzZWxlY3Rpb24uaGVhZC5saW5lLTEwLCBjaDpzZWxlY3Rpb24uaGVhZC5jaH07XG4gIHJldHVybiB7IGFuY2hvcjogc2VsZWN0aW9uLmFuY2hvciwgaGVhZDogbmV3X2hkIH07XG59O1xuXG5leHBvcnQgY29uc3QgYWRkQ3Vyc29yc1RvU2VsZWN0aW9uRW5kcyA9IChcbiAgZWRpdG9yOiBFZGl0b3IsXG4gIGVtdWxhdGU6IENPREVfRURJVE9SID0gQ09ERV9FRElUT1IuVlNDT0RFLFxuKSA9PiB7XG4gIC8vIE9ubHkgYXBwbHkgdGhlIGFjdGlvbiBpZiB0aGVyZSBpcyBleGFjdGx5IG9uZSBzZWxlY3Rpb25cbiAgaWYgKGVkaXRvci5saXN0U2VsZWN0aW9ucygpLmxlbmd0aCAhPT0gMSkge1xuICAgIHJldHVybjtcbiAgfVxuICBjb25zdCBzZWxlY3Rpb24gPSBlZGl0b3IubGlzdFNlbGVjdGlvbnMoKVswXTtcbiAgY29uc3QgeyBmcm9tLCB0bywgaGFzVHJhaWxpbmdOZXdsaW5lIH0gPSBnZXRTZWxlY3Rpb25Cb3VuZGFyaWVzKHNlbGVjdGlvbik7XG4gIGNvbnN0IG5ld1NlbGVjdGlvbnMgPSBbXTtcbiAgLy8gRXhjbHVkZSBsaW5lIHN0YXJ0aW5nIGF0IHRyYWlsaW5nIG5ld2xpbmUgZnJvbSBoYXZpbmcgY3Vyc29yIGFkZGVkXG4gIGNvbnN0IHRvTGluZSA9IGhhc1RyYWlsaW5nTmV3bGluZSA/IHRvLmxpbmUgLSAxIDogdG8ubGluZTtcbiAgZm9yIChsZXQgbGluZSA9IGZyb20ubGluZTsgbGluZSA8PSB0b0xpbmU7IGxpbmUrKykge1xuICAgIGNvbnN0IGhlYWQgPSBsaW5lID09PSB0by5saW5lID8gdG8gOiBnZXRMaW5lRW5kUG9zKGxpbmUsIGVkaXRvcik7XG4gICAgbGV0IGFuY2hvcjogRWRpdG9yUG9zaXRpb247XG4gICAgaWYgKGVtdWxhdGUgPT09IENPREVfRURJVE9SLlZTQ09ERSkge1xuICAgICAgYW5jaG9yID0gaGVhZDtcbiAgICB9IGVsc2Uge1xuICAgICAgYW5jaG9yID0gbGluZSA9PT0gZnJvbS5saW5lID8gZnJvbSA6IGdldExpbmVTdGFydFBvcyhsaW5lKTtcbiAgICB9XG4gICAgbmV3U2VsZWN0aW9ucy5wdXNoKHtcbiAgICAgIGFuY2hvcixcbiAgICAgIGhlYWQsXG4gICAgfSk7XG4gIH1cbiAgZWRpdG9yLnNldFNlbGVjdGlvbnMobmV3U2VsZWN0aW9ucyk7XG59O1xuXG5leHBvcnQgY29uc3QgZ29Ub0xpbmVCb3VuZGFyeSA9IChcbiAgZWRpdG9yOiBFZGl0b3IsXG4gIHNlbGVjdGlvbjogRWRpdG9yU2VsZWN0aW9uLFxuICBib3VuZGFyeTogJ3N0YXJ0JyB8ICdlbmQnLFxuKSA9PiB7XG4gIGNvbnN0IHsgZnJvbSwgdG8gfSA9IGdldFNlbGVjdGlvbkJvdW5kYXJpZXMoc2VsZWN0aW9uKTtcbiAgaWYgKGJvdW5kYXJ5ID09PSAnc3RhcnQnKSB7XG4gICAgcmV0dXJuIHsgYW5jaG9yOiBnZXRMaW5lU3RhcnRQb3MoZnJvbS5saW5lKSB9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB7IGFuY2hvcjogZ2V0TGluZUVuZFBvcyh0by5saW5lLCBlZGl0b3IpIH07XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBuYXZpZ2F0ZUxpbmUgPSAoXG4gIGVkaXRvcjogRWRpdG9yLFxuICBzZWxlY3Rpb246IEVkaXRvclNlbGVjdGlvbixcbiAgcG9zaXRpb246ICduZXh0JyB8ICdwcmV2JyB8ICdmaXJzdCcgfCAnbGFzdCcsXG4pID0+IHtcbiAgY29uc3QgcG9zID0gc2VsZWN0aW9uLmhlYWQ7XG4gIGxldCBsaW5lOiBudW1iZXI7XG4gIGxldCBjaDogbnVtYmVyO1xuXG4gIGlmIChwb3NpdGlvbiA9PT0gJ3ByZXYnKSB7XG4gICAgbGluZSA9IE1hdGgubWF4KHBvcy5saW5lIC0gMSwgMCk7XG4gICAgY29uc3QgZW5kT2ZMaW5lID0gZ2V0TGluZUVuZFBvcyhsaW5lLCBlZGl0b3IpO1xuICAgIGNoID0gTWF0aC5taW4ocG9zLmNoLCBlbmRPZkxpbmUuY2gpO1xuICB9XG4gIGlmIChwb3NpdGlvbiA9PT0gJ25leHQnKSB7XG4gICAgbGluZSA9IE1hdGgubWluKHBvcy5saW5lICsgMSwgZWRpdG9yLmxpbmVDb3VudCgpIC0gMSk7XG4gICAgY29uc3QgZW5kT2ZMaW5lID0gZ2V0TGluZUVuZFBvcyhsaW5lLCBlZGl0b3IpO1xuICAgIGNoID0gTWF0aC5taW4ocG9zLmNoLCBlbmRPZkxpbmUuY2gpO1xuICB9XG4gIGlmIChwb3NpdGlvbiA9PT0gJ2ZpcnN0Jykge1xuICAgIGxpbmUgPSAwO1xuICAgIGNoID0gMDtcbiAgfVxuICBpZiAocG9zaXRpb24gPT09ICdsYXN0Jykge1xuICAgIGxpbmUgPSBlZGl0b3IubGluZUNvdW50KCkgLSAxO1xuICAgIGNvbnN0IGVuZE9mTGluZSA9IGdldExpbmVFbmRQb3MobGluZSwgZWRpdG9yKTtcbiAgICBjaCA9IGVuZE9mTGluZS5jaDtcbiAgfVxuXG4gIHJldHVybiB7IGFuY2hvcjogeyBsaW5lLCBjaCB9IH07XG59O1xuXG5leHBvcnQgY29uc3QgbW92ZUN1cnNvciA9IChcbiAgZWRpdG9yOiBFZGl0b3IsXG4gIGRpcmVjdGlvbjogJ3VwJyB8ICdkb3duJyB8ICdsZWZ0JyB8ICdyaWdodCcsXG4pID0+IHtcbiAgc3dpdGNoIChkaXJlY3Rpb24pIHtcbiAgICBjYXNlICd1cCc6XG4gICAgICBlZGl0b3IuZXhlYygnZ29VcCcpO1xuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnZG93bic6XG4gICAgICBlZGl0b3IuZXhlYygnZ29Eb3duJyk7XG4gICAgICBicmVhaztcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIGVkaXRvci5leGVjKCdnb0xlZnQnKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIGVkaXRvci5leGVjKCdnb1JpZ2h0Jyk7XG4gICAgICBicmVhaztcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IG1vdmVXb3JkID0gKGVkaXRvcjogRWRpdG9yLCBkaXJlY3Rpb246ICdsZWZ0JyB8ICdyaWdodCcpID0+IHtcbiAgc3dpdGNoIChkaXJlY3Rpb24pIHtcbiAgICBjYXNlICdsZWZ0JzpcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBjb21tYW5kIG5vdCBkZWZpbmVkIGluIE9ic2lkaWFuIEFQSVxuICAgICAgZWRpdG9yLmV4ZWMoJ2dvV29yZExlZnQnKTtcbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ3JpZ2h0JzpcbiAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgLSBjb21tYW5kIG5vdCBkZWZpbmVkIGluIE9ic2lkaWFuIEFQSVxuICAgICAgZWRpdG9yLmV4ZWMoJ2dvV29yZFJpZ2h0Jyk7XG4gICAgICBicmVhaztcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHRyYW5zZm9ybUNhc2UgPSAoXG4gIGVkaXRvcjogRWRpdG9yLFxuICBzZWxlY3Rpb246IEVkaXRvclNlbGVjdGlvbixcbiAgY2FzZVR5cGU6IENBU0UsXG4pID0+IHtcbiAgbGV0IHsgZnJvbSwgdG8gfSA9IGdldFNlbGVjdGlvbkJvdW5kYXJpZXMoc2VsZWN0aW9uKTtcbiAgbGV0IHNlbGVjdGVkVGV4dCA9IGVkaXRvci5nZXRSYW5nZShmcm9tLCB0byk7XG5cbiAgLy8gYXBwbHkgdHJhbnNmb3JtIG9uIHdvcmQgYXQgY3Vyc29yIGlmIG5vdGhpbmcgaXMgc2VsZWN0ZWRcbiAgaWYgKHNlbGVjdGVkVGV4dC5sZW5ndGggPT09IDApIHtcbiAgICBjb25zdCBwb3MgPSBzZWxlY3Rpb24uaGVhZDtcbiAgICBjb25zdCB7IGFuY2hvciwgaGVhZCB9ID0gd29yZFJhbmdlQXRQb3MocG9zLCBlZGl0b3IuZ2V0TGluZShwb3MubGluZSkpO1xuICAgIFtmcm9tLCB0b10gPSBbYW5jaG9yLCBoZWFkXTtcbiAgICBzZWxlY3RlZFRleHQgPSBlZGl0b3IuZ2V0UmFuZ2UoYW5jaG9yLCBoZWFkKTtcbiAgfVxuXG4gIGxldCByZXBsYWNlbWVudFRleHQgPSBzZWxlY3RlZFRleHQ7XG5cbiAgc3dpdGNoIChjYXNlVHlwZSkge1xuICAgIGNhc2UgQ0FTRS5VUFBFUjoge1xuICAgICAgcmVwbGFjZW1lbnRUZXh0ID0gc2VsZWN0ZWRUZXh0LnRvVXBwZXJDYXNlKCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSBDQVNFLkxPV0VSOiB7XG4gICAgICByZXBsYWNlbWVudFRleHQgPSBzZWxlY3RlZFRleHQudG9Mb3dlckNhc2UoKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBjYXNlIENBU0UuVElUTEU6IHtcbiAgICAgIHJlcGxhY2VtZW50VGV4dCA9IHRvVGl0bGVDYXNlKHNlbGVjdGVkVGV4dCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gICAgY2FzZSBDQVNFLk5FWFQ6IHtcbiAgICAgIHJlcGxhY2VtZW50VGV4dCA9IGdldE5leHRDYXNlKHNlbGVjdGVkVGV4dCk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cblxuICBlZGl0b3IucmVwbGFjZVJhbmdlKHJlcGxhY2VtZW50VGV4dCwgZnJvbSwgdG8pO1xuXG4gIHJldHVybiBzZWxlY3Rpb247XG59O1xuXG5jb25zdCBleHBhbmRTZWxlY3Rpb24gPSAoe1xuICBlZGl0b3IsXG4gIHNlbGVjdGlvbixcbiAgb3BlbmluZ0NoYXJhY3RlckNoZWNrLFxuICBtYXRjaGluZ0NoYXJhY3Rlck1hcCxcbn06IHtcbiAgZWRpdG9yOiBFZGl0b3I7XG4gIHNlbGVjdGlvbjogRWRpdG9yU2VsZWN0aW9uO1xuICBvcGVuaW5nQ2hhcmFjdGVyQ2hlY2s6IENoZWNrQ2hhcmFjdGVyO1xuICBtYXRjaGluZ0NoYXJhY3Rlck1hcDogTWF0Y2hpbmdDaGFyYWN0ZXJNYXA7XG59KSA9PiB7XG4gIGxldCB7IGFuY2hvciwgaGVhZCB9ID0gc2VsZWN0aW9uO1xuXG4gIC8vIGluIGNhc2UgdXNlciBzZWxlY3RzIHVwd2FyZHNcbiAgaWYgKGFuY2hvci5saW5lID49IGhlYWQubGluZSAmJiBhbmNob3IuY2ggPiBhbmNob3IuY2gpIHtcbiAgICBbYW5jaG9yLCBoZWFkXSA9IFtoZWFkLCBhbmNob3JdO1xuICB9XG5cbiAgY29uc3QgbmV3QW5jaG9yID0gZmluZFBvc09mTmV4dENoYXJhY3Rlcih7XG4gICAgZWRpdG9yLFxuICAgIHN0YXJ0UG9zOiBhbmNob3IsXG4gICAgY2hlY2tDaGFyYWN0ZXI6IG9wZW5pbmdDaGFyYWN0ZXJDaGVjayxcbiAgICBzZWFyY2hEaXJlY3Rpb246IFNFQVJDSF9ESVJFQ1RJT04uQkFDS1dBUkQsXG4gIH0pO1xuICBpZiAoIW5ld0FuY2hvcikge1xuICAgIHJldHVybiBzZWxlY3Rpb247XG4gIH1cblxuICBjb25zdCBuZXdIZWFkID0gZmluZFBvc09mTmV4dENoYXJhY3Rlcih7XG4gICAgZWRpdG9yLFxuICAgIHN0YXJ0UG9zOiBoZWFkLFxuICAgIGNoZWNrQ2hhcmFjdGVyOiAoY2hhcjogc3RyaW5nKSA9PlxuICAgICAgY2hhciA9PT0gbWF0Y2hpbmdDaGFyYWN0ZXJNYXBbbmV3QW5jaG9yLm1hdGNoXSxcbiAgICBzZWFyY2hEaXJlY3Rpb246IFNFQVJDSF9ESVJFQ1RJT04uRk9SV0FSRCxcbiAgfSk7XG4gIGlmICghbmV3SGVhZCkge1xuICAgIHJldHVybiBzZWxlY3Rpb247XG4gIH1cblxuICByZXR1cm4geyBhbmNob3I6IG5ld0FuY2hvci5wb3MsIGhlYWQ6IG5ld0hlYWQucG9zIH07XG59O1xuXG5leHBvcnQgY29uc3QgZXhwYW5kU2VsZWN0aW9uVG9CcmFja2V0cyA9IChcbiAgZWRpdG9yOiBFZGl0b3IsXG4gIHNlbGVjdGlvbjogRWRpdG9yU2VsZWN0aW9uLFxuKSA9PlxuICBleHBhbmRTZWxlY3Rpb24oe1xuICAgIGVkaXRvcixcbiAgICBzZWxlY3Rpb24sXG4gICAgb3BlbmluZ0NoYXJhY3RlckNoZWNrOiAoY2hhcjogc3RyaW5nKSA9PiAvWyhbe10vLnRlc3QoY2hhciksXG4gICAgbWF0Y2hpbmdDaGFyYWN0ZXJNYXA6IE1BVENISU5HX0JSQUNLRVRTLFxuICB9KTtcblxuZXhwb3J0IGNvbnN0IGV4cGFuZFNlbGVjdGlvblRvUXVvdGVzID0gKFxuICBlZGl0b3I6IEVkaXRvcixcbiAgc2VsZWN0aW9uOiBFZGl0b3JTZWxlY3Rpb24sXG4pID0+XG4gIGV4cGFuZFNlbGVjdGlvbih7XG4gICAgZWRpdG9yLFxuICAgIHNlbGVjdGlvbixcbiAgICBvcGVuaW5nQ2hhcmFjdGVyQ2hlY2s6IChjaGFyOiBzdHJpbmcpID0+IC9bJ1wiYF0vLnRlc3QoY2hhciksXG4gICAgbWF0Y2hpbmdDaGFyYWN0ZXJNYXA6IE1BVENISU5HX1FVT1RFUyxcbiAgfSk7XG5cbmV4cG9ydCBjb25zdCBleHBhbmRTZWxlY3Rpb25Ub1F1b3Rlc09yQnJhY2tldHMgPSAoZWRpdG9yOiBFZGl0b3IpID0+IHtcbiAgY29uc3Qgc2VsZWN0aW9ucyA9IGVkaXRvci5saXN0U2VsZWN0aW9ucygpO1xuICBjb25zdCBuZXdTZWxlY3Rpb24gPSBleHBhbmRTZWxlY3Rpb24oe1xuICAgIGVkaXRvcixcbiAgICBzZWxlY3Rpb246IHNlbGVjdGlvbnNbMF0sXG4gICAgb3BlbmluZ0NoYXJhY3RlckNoZWNrOiAoY2hhcjogc3RyaW5nKSA9PiAvWydcImAoW3tdLy50ZXN0KGNoYXIpLFxuICAgIG1hdGNoaW5nQ2hhcmFjdGVyTWFwOiBNQVRDSElOR19RVU9URVNfQlJBQ0tFVFMsXG4gIH0pO1xuICBlZGl0b3Iuc2V0U2VsZWN0aW9ucyhbLi4uc2VsZWN0aW9ucywgbmV3U2VsZWN0aW9uXSk7XG59O1xuXG5jb25zdCBpbnNlcnRDdXJzb3IgPSAoZWRpdG9yOiBFZGl0b3IsIGxpbmVPZmZzZXQ6IG51bWJlcikgPT4ge1xuICBjb25zdCBzZWxlY3Rpb25zID0gZWRpdG9yLmxpc3RTZWxlY3Rpb25zKCk7XG4gIGNvbnN0IG5ld1NlbGVjdGlvbnMgPSBbXTtcbiAgZm9yIChjb25zdCBzZWxlY3Rpb24gb2Ygc2VsZWN0aW9ucykge1xuICAgIGNvbnN0IHsgbGluZSwgY2ggfSA9IHNlbGVjdGlvbi5oZWFkO1xuICAgIGlmIChcbiAgICAgIChsaW5lID09PSAwICYmIGxpbmVPZmZzZXQgPCAwKSB8fFxuICAgICAgKGxpbmUgPT09IGVkaXRvci5sYXN0TGluZSgpICYmIGxpbmVPZmZzZXQgPiAwKVxuICAgICkge1xuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGNvbnN0IHRhcmdldExpbmVMZW5ndGggPSBlZGl0b3IuZ2V0TGluZShsaW5lICsgbGluZU9mZnNldCkubGVuZ3RoO1xuICAgIG5ld1NlbGVjdGlvbnMucHVzaCh7XG4gICAgICBhbmNob3I6IHtcbiAgICAgICAgbGluZTogc2VsZWN0aW9uLmFuY2hvci5saW5lICsgbGluZU9mZnNldCxcbiAgICAgICAgY2g6IE1hdGgubWluKHNlbGVjdGlvbi5hbmNob3IuY2gsIHRhcmdldExpbmVMZW5ndGgpLFxuICAgICAgfSxcbiAgICAgIGhlYWQ6IHtcbiAgICAgICAgbGluZTogbGluZSArIGxpbmVPZmZzZXQsXG4gICAgICAgIGNoOiBNYXRoLm1pbihjaCwgdGFyZ2V0TGluZUxlbmd0aCksXG4gICAgICB9LFxuICAgIH0pO1xuICB9XG4gIGVkaXRvci5zZXRTZWxlY3Rpb25zKFsuLi5lZGl0b3IubGlzdFNlbGVjdGlvbnMoKSwgLi4ubmV3U2VsZWN0aW9uc10pO1xufTtcblxuZXhwb3J0IGNvbnN0IGluc2VydEN1cnNvckFib3ZlID0gKGVkaXRvcjogRWRpdG9yKSA9PiBpbnNlcnRDdXJzb3IoZWRpdG9yLCAtMSk7XG5cbmV4cG9ydCBjb25zdCBpbnNlcnRDdXJzb3JCZWxvdyA9IChlZGl0b3I6IEVkaXRvcikgPT4gaW5zZXJ0Q3Vyc29yKGVkaXRvciwgMSk7XG5cbmV4cG9ydCBjb25zdCBnb1RvSGVhZGluZyA9IChcbiAgYXBwOiBBcHAsXG4gIGVkaXRvcjogRWRpdG9yLFxuICBib3VuZGFyeTogJ3ByZXYnIHwgJ25leHQnLFxuKSA9PiB7XG4gIGNvbnN0IGZpbGUgPSBhcHAubWV0YWRhdGFDYWNoZS5nZXRGaWxlQ2FjaGUoYXBwLndvcmtzcGFjZS5nZXRBY3RpdmVGaWxlKCkpO1xuICBpZiAoIWZpbGUuaGVhZGluZ3MgfHwgZmlsZS5oZWFkaW5ncy5sZW5ndGggPT09IDApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB7IGxpbmUgfSA9IGVkaXRvci5nZXRDdXJzb3IoJ2Zyb20nKTtcbiAgbGV0IHByZXZIZWFkaW5nTGluZSA9IDA7XG4gIGxldCBuZXh0SGVhZGluZ0xpbmUgPSBlZGl0b3IubGFzdExpbmUoKTtcblxuICBmaWxlLmhlYWRpbmdzLmZvckVhY2goKHsgcG9zaXRpb24gfSkgPT4ge1xuICAgIGNvbnN0IHsgZW5kOiBoZWFkaW5nUG9zIH0gPSBwb3NpdGlvbjtcbiAgICBpZiAobGluZSA+IGhlYWRpbmdQb3MubGluZSAmJiBoZWFkaW5nUG9zLmxpbmUgPiBwcmV2SGVhZGluZ0xpbmUpIHtcbiAgICAgIHByZXZIZWFkaW5nTGluZSA9IGhlYWRpbmdQb3MubGluZTtcbiAgICB9XG4gICAgaWYgKGxpbmUgPCBoZWFkaW5nUG9zLmxpbmUgJiYgaGVhZGluZ1Bvcy5saW5lIDwgbmV4dEhlYWRpbmdMaW5lKSB7XG4gICAgICBuZXh0SGVhZGluZ0xpbmUgPSBoZWFkaW5nUG9zLmxpbmU7XG4gICAgfVxuICB9KTtcblxuICBlZGl0b3Iuc2V0U2VsZWN0aW9uKFxuICAgIGJvdW5kYXJ5ID09PSAncHJldidcbiAgICAgID8gZ2V0TGluZUVuZFBvcyhwcmV2SGVhZGluZ0xpbmUsIGVkaXRvcilcbiAgICAgIDogZ2V0TGluZUVuZFBvcyhuZXh0SGVhZGluZ0xpbmUsIGVkaXRvciksXG4gICk7XG59O1xuIiwgImltcG9ydCB7IFBsdWdpblNldHRpbmdUYWIsIEFwcCwgU2V0dGluZywgVG9nZ2xlQ29tcG9uZW50IH0gZnJvbSAnb2JzaWRpYW4nO1xuaW1wb3J0IENvZGVFZGl0b3JTaG9ydGN1dHMgZnJvbSAnLi9tYWluJztcblxuZXhwb3J0IGludGVyZmFjZSBQbHVnaW5TZXR0aW5ncyB7XG4gIGF1dG9JbnNlcnRMaXN0UHJlZml4OiBib29sZWFuO1xufVxuXG5leHBvcnQgY29uc3QgREVGQVVMVF9TRVRUSU5HUzogUGx1Z2luU2V0dGluZ3MgPSB7XG4gIGF1dG9JbnNlcnRMaXN0UHJlZml4OiB0cnVlLFxufTtcblxuZXhwb3J0IGNsYXNzIFNldHRpbmdUYWIgZXh0ZW5kcyBQbHVnaW5TZXR0aW5nVGFiIHtcbiAgcGx1Z2luOiBDb2RlRWRpdG9yU2hvcnRjdXRzO1xuXG4gIGNvbnN0cnVjdG9yKGFwcDogQXBwLCBwbHVnaW46IENvZGVFZGl0b3JTaG9ydGN1dHMpIHtcbiAgICBzdXBlcihhcHAsIHBsdWdpbik7XG4gICAgdGhpcy5wbHVnaW4gPSBwbHVnaW47XG4gIH1cblxuICBkaXNwbGF5KCkge1xuICAgIGNvbnN0IHsgY29udGFpbmVyRWwgfSA9IHRoaXM7XG5cbiAgICBjb250YWluZXJFbC5lbXB0eSgpO1xuXG4gICAgY29udGFpbmVyRWwuY3JlYXRlRWwoJ2gyJywgeyB0ZXh0OiAnQ29kZSBFZGl0b3IgU2hvcnRjdXRzJyB9KTtcblxuICAgIGNvbnN0IGxpc3RQcmVmaXhTZXR0aW5nID0gbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAuc2V0TmFtZSgnQXV0byBpbnNlcnQgbGlzdCBwcmVmaXgnKVxuICAgICAgLnNldERlc2MoXG4gICAgICAgICdBdXRvbWF0aWNhbGx5IGluc2VydCBsaXN0IHByZWZpeCB3aGVuIGluc2VydGluZyBhIGxpbmUgYWJvdmUgb3IgYmVsb3cnLFxuICAgICAgKVxuICAgICAgLmFkZFRvZ2dsZSgodG9nZ2xlKSA9PlxuICAgICAgICB0b2dnbGVcbiAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b0luc2VydExpc3RQcmVmaXgpXG4gICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuYXV0b0luc2VydExpc3RQcmVmaXggPSB2YWx1ZTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMucGx1Z2luLnNhdmVTZXR0aW5ncygpO1xuICAgICAgICAgIH0pLFxuICAgICAgKTtcblxuICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKS5zZXROYW1lKCdSZXNldCBkZWZhdWx0cycpLmFkZEJ1dHRvbigoYnRuKSA9PiB7XG4gICAgICBidG4uc2V0QnV0dG9uVGV4dCgnUmVzZXQnKS5vbkNsaWNrKGFzeW5jICgpID0+IHtcbiAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MgPSB7IC4uLkRFRkFVTFRfU0VUVElOR1MgfTtcbiAgICAgICAgKGxpc3RQcmVmaXhTZXR0aW5nLmNvbXBvbmVudHNbMF0gYXMgVG9nZ2xlQ29tcG9uZW50KS5zZXRWYWx1ZShcbiAgICAgICAgICBERUZBVUxUX1NFVFRJTkdTLmF1dG9JbnNlcnRMaXN0UHJlZml4LFxuICAgICAgICApO1xuICAgICAgICBhd2FpdCB0aGlzLnBsdWdpbi5zYXZlU2V0dGluZ3MoKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9XG59XG4iLCAiaW1wb3J0IHsgQXBwLCBTdWdnZXN0TW9kYWwgfSBmcm9tICdvYnNpZGlhbic7XG5cbmV4cG9ydCBjbGFzcyBHb1RvTGluZU1vZGFsIGV4dGVuZHMgU3VnZ2VzdE1vZGFsPHN0cmluZz4ge1xuICBwcml2YXRlIGxpbmVDb3VudDtcbiAgcHJpdmF0ZSBvblN1Ym1pdDtcblxuICBjb25zdHJ1Y3RvcihcbiAgICBhcHA6IEFwcCxcbiAgICBsaW5lQ291bnQ6IG51bWJlcixcbiAgICBvblN1Ym1pdDogKGxpbmVOdW1iZXI6IG51bWJlcikgPT4gdm9pZCxcbiAgKSB7XG4gICAgc3VwZXIoYXBwKTtcbiAgICB0aGlzLmxpbmVDb3VudCA9IGxpbmVDb3VudDtcbiAgICB0aGlzLm9uU3VibWl0ID0gb25TdWJtaXQ7XG5cbiAgICBjb25zdCBQUk9NUFRfVEVYVCA9IGBFbnRlciBhIGxpbmUgbnVtYmVyIGJldHdlZW4gMSBhbmQgJHtsaW5lQ291bnR9YDtcbiAgICB0aGlzLmxpbWl0ID0gMTtcbiAgICB0aGlzLnNldFBsYWNlaG9sZGVyKFBST01QVF9URVhUKTtcbiAgICB0aGlzLmVtcHR5U3RhdGVUZXh0ID0gUFJPTVBUX1RFWFQ7XG4gIH1cblxuICBnZXRTdWdnZXN0aW9ucyhsaW5lOiBzdHJpbmcpOiBzdHJpbmdbXSB7XG4gICAgY29uc3QgbGluZU51bWJlciA9IHBhcnNlSW50KGxpbmUpO1xuICAgIGlmIChsaW5lLmxlbmd0aCA+IDAgJiYgbGluZU51bWJlciA+IDAgJiYgbGluZU51bWJlciA8PSB0aGlzLmxpbmVDb3VudCkge1xuICAgICAgcmV0dXJuIFtsaW5lXTtcbiAgICB9XG4gICAgcmV0dXJuIFtdO1xuICB9XG5cbiAgcmVuZGVyU3VnZ2VzdGlvbihsaW5lOiBzdHJpbmcsIGVsOiBIVE1MRWxlbWVudCkge1xuICAgIGVsLmNyZWF0ZUVsKCdkaXYnLCB7IHRleHQ6IGxpbmUgfSk7XG4gIH1cblxuICBvbkNob29zZVN1Z2dlc3Rpb24obGluZTogc3RyaW5nKSB7XG4gICAgLy8gU3VidHJhY3QgMSBhcyBsaW5lIG51bWJlcnMgYXJlIHplcm8taW5kZXhlZFxuICAgIHRoaXMub25TdWJtaXQocGFyc2VJbnQobGluZSkgLSAxKTtcbiAgfVxufVxuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQTtBQUFBO0FBQUE7QUFBQSx1QkFBdUM7OztBQ0FoQyxJQUFLO0FBQUwsVUFBSyxPQUFMO0FBQ0wsbUJBQVE7QUFDUixtQkFBUTtBQUNSLG1CQUFRO0FBQ1Isa0JBQU87QUFBQSxHQUpHO0FBT0wsSUFBTSxxQkFBcUIsQ0FBQyxPQUFPLEtBQUs7QUFFeEMsSUFBSztBQUFMLFVBQUssbUJBQUw7QUFDTCxpQ0FBVTtBQUNWLGtDQUFXO0FBQUEsR0FGRDtBQU9MLElB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
