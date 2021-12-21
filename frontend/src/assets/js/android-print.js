function quickPrint(data) {
    var textEncoded = encodeURI(data);
    window.location.href = "intent://" + textEncoded + "#Intent;scheme=quickprinter;package=pe.diegoveloper.printerserverapp;end;";
}