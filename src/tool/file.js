const fileHelper = {
    _fakeClick(obj) {
        let ev = document.createEvent('MouseEvents');
        ev.initMouseEvent(
            'click', true, false, window, 0, 0, 0, 0, 0
            , false, false, false, false, 0, null
        );
        obj.dispatchEvent(ev);
    },
    save(name, data) {
        const urlObject = window.URL || window.webkitURL || window;
        const export_blob = new Blob([data]);
        const save_link = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
        save_link.href = urlObject.createObjectURL(export_blob);
        save_link.download = name;
        fileHelper._fakeClick(save_link);
    },
    readJson(event) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            const files = event.target.files;
            reader.readAsText(files[0]);
            reader.onload = function(res) {
                const target = res.target;
                if (target.readyState === 2) {
                    try {
                        let json = JSON.parse(target.result);
                        resolve(json);
                    } catch(err) {
                        reject(err);
                    }
                  
                }
            }
        });
    }
};

export default fileHelper;