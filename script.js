require.config({ paths: { 'vs': 'andorra-editor/min/vs' } });
require(['vs/editor/editor.main'], function () {
    monaco.languages.register({ id: 'plaintext' });

    monaco.languages.setMonarchTokensProvider('plaintext', {
        tokenizer: {
            root: [
                [/https?:\/\/[^\s]+/, 'url'],
            ]
        }
    });

    monaco.editor.defineTheme('WebScript', {
        base: 'vs-dark',
        inherit: true,
        rules: [
            { token: 'url', foreground: '569cd6' }
        ],
        colors: {
            'editor.foreground': '#dcdcdc',
            'editor.background': '#1e1e1e',
            'editorCursor.foreground': '#e7e7e7',
            'editor.lineHighlightBackground': '#2e2e2e',
            'editorLineNumber.foreground': '#8a8a8a',
            'editor.selectionBackground': '#264f78',
            'minimap.background': '#1e1e1e',
            'minimap.foreground': '#dcdcdc'
        }
    });

    var editor = monaco.editor.create(document.getElementById('editor'), {
        value: `Welcome to your notebook! Feel free to write yourself a message and save it for later!`,
        language: 'plaintext',
        theme: 'WebScript',
        automaticLayout: true,
        fontSize: 18,
        fontFamily: 'andorraMono, TwemojiRubisco, Arial, Helvetica, sans-serif',
        scrollBeyondLastLine: true,
        minimap: { enabled: true },
        lineNumbers: "on",
        wordWrap: "off"
    });

    const font = new FontFace('andorraMono', 'url(https://andorraeditor.pages.dev/assets/fonts/andorra.ttf)');

    font.load().then(() => {
        document.fonts.add(font);
        monaco.editor.remeasureFonts();
    }).catch((error) => {
        console.error('Error loading custom font:', error);
    });

    function openFile() {
        var input = document.createElement('input');
        input.type = 'file';
        input.accept = 'text/plain, .dt';
        input.onchange = function(event) {
            var file = event.target.files[0];
            var reader = new FileReader();
            reader.onload = function() {
                editor.setValue(reader.result);
                document.title = file.name;
            };
            reader.readAsText(file);
        };
        input.click();
    }

    function saveFile() {
        var content = editor.getValue();
        var blob = new Blob([content], { type: 'text/plain' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        var currentDate = new Date().toISOString().slice(0, 19).replace(/[-T:/]/g, '');
        var fileName = 'note_' + currentDate + '.txt';
        a.download = fileName;
        document.title = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        isModified = false;
    }

    function saveDump() {
        var content = editor.getValue();
        var blob = new Blob([content], { type: 'text/dotlin' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        var currentDate = new Date().toISOString().slice(0, 19).replace(/[-T:/]/g, '');
        var fileName = 'savedump_' + currentDate + '.dt';
        a.download = fileName;
        document.title = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        isModified = false;
    }

    document.getElementById('openButton').addEventListener('click', openFile);
    document.getElementById('saveButton').addEventListener('click', saveFile);
    document.getElementById('saveDump').addEventListener('click', saveDump);

    var isModified = false;

    editor.onDidChangeModelContent(function() {
        isModified = true;
        var fileName = document.title;
        if (!fileName.endsWith('*')) {
            fileName += "*";
        }
        document.title = fileName;
    });

    window.addEventListener('beforeunload', function(e) {
        if (isModified) {
            var confirmationMessage = 'You have unsaved changes. Are you sure you want to leave?';
            e.returnValue = confirmationMessage;
            return confirmationMessage;
        }
    });

    document.getElementById('lineWrapSelect').addEventListener('change', function() {
        var value = this.value;
        editor.updateOptions({ wordWrap: value });
    });

    document.getElementById('minimapSelect').addEventListener('change', function() {
        var value = this.value;
        editor.updateOptions({ minimap: { enabled: value === 'on' } });
    });

    window.addEventListener('keydown', function(event) {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            saveFile();
        } else if (event.ctrlKey && event.key === 'o') {
            event.preventDefault();
            openFile();
        } else if (event.altKey && event.key === 'm') {
            event.preventDefault();
            var minimapEnabled = editor.getOption(monaco.editor.EditorOption.minimap).enabled;
            editor.updateOptions({ minimap: { enabled: !minimapEnabled } });
            document.getElementById('minimapSelect').value = minimapEnabled ? 'off' : 'on';
        } else if (event.altKey && event.key === 'z') {
            event.preventDefault();
            var wordWrapEnabled = editor.getOption(monaco.editor.EditorOption.wordWrap) === 'on';
            editor.updateOptions({ wordWrap: wordWrapEnabled ? 'off' : 'on' });
            document.getElementById('lineWrapSelect').value = wordWrapEnabled ? 'off' : 'on';
        }
    });

    var divider = document.getElementById('divider');
    var editorContainer = document.getElementById('editor-container');
    var editorElement = document.getElementById('editor');
    var isResizing = false;

    divider.addEventListener('mousedown', function(e) {
        isResizing = true;
        document.body.style.cursor = 'ew-resize';
    });

    document.addEventListener('mousemove', function(e) {
        if (isResizing) {
            var offsetRight = editorContainer.clientWidth - (e.clientX - editorContainer.offsetLeft);
            var editorWidth = editorContainer.clientWidth - offsetRight;
            editorWidth = Math.max(editorWidth, 100);
            editorElement.style.width = editorWidth + 'px';
        }
    });

    document.addEventListener('mouseup', function() {
        if (isResizing) {
            isResizing = false;
            document.body.style.cursor = 'default';
        }
    });
});