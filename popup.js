// ###########################################################################################3
// Initialize Firebase
// config object is loaded from the file firebaseConfig.js
firebase.initializeApp(config);
var database = firebase.database();
// ###########################################################################################3



function httpGet(theUrl) {
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false); // false for synchronous request
    xmlHttp.send(null);
    return xmlHttp.responseText;
}

function checkHebrew(str) {
    var HebrewLetters = "אבגדהוזחטיכלמנסעפצקרשתךףץןם";
    for (var i = 0; i < HebrewLetters.length; i++) {
        if (str.includes(HebrewLetters.charAt(i))) {
            return true;
        }
    }
    return false;
}

function translateFunction() {
    var text = document.getElementById("translateInput").value;
    document.getElementById("result").innerHTML = "";

    text = text.replace(".", "");
    var splitSpa = text.split(" ");
    for (var i = splitSpa.length - 1; i >= 0; i--) {
        if (splitSpa[i] === "") {
            splitSpa.splice(i, 1);
        }
    }
    var joinSpa = splitSpa.join('%20');
    var morfixLink = "https://www.morfix.co.il/" + joinSpa;
    document.getElementById("MorfixHref").setAttribute('href', morfixLink);
    var googleTranslateLink;
    if (checkHebrew(joinSpa)) {
        googleTranslateLink = "https://translate.google.co.il/?hl=iw#view=home&op=translate&sl=iw&tl=en&text=" + joinSpa;
    } else {
        googleTranslateLink = "https://translate.google.co.il/?hl=iw#view=home&op=translate&sl=en&tl=iw&text=" + joinSpa;
    }
    document.getElementById("GoogleTranslateHref").setAttribute('href', googleTranslateLink);

    var morfixCode = httpGet(morfixLink);

    if (morfixCode.includes('class="wiki_to_he">')) {
        var res = morfixCode.split('class="wiki_to_he">');
        res = res[1].split('</div>');
        var result = res[0];
        document.getElementById("result").innerHTML += result;
    }
    if (morfixCode.includes('class="wiki_to_en">')) {
        var res = morfixCode.split('class="wiki_to_en">');
        res = res[1].split('</div>');
        var result = res[0];
        document.getElementById("result").innerHTML += result;
    }
    if (morfixCode.includes('class="normal_translation_div">')) {
        // document.getElementById("result").innerHTML += "<h3>" + word + "</h3> (" + word2 + ")<br>";
        // document.getElementById("result").innerHTML += word3 + "<br>";

        var count = (morfixCode.match(/class="normal_translation_div">/g) || []).length;
        for (var i = 1; i <= count; i++) {

            if (i != 1) {
                document.getElementById("result").innerHTML += "------------------------------------";
            }

            var wordsLeftSide, word = "", word2 = "", word3 = "";
            if (morfixCode.includes('row Translation_divTop_enTohe')) {
                wordsLeftSide = morfixCode.split('row Translation_divTop_enTohe');

                if (wordsLeftSide[i].includes('class="Translation_spTop_enTohe">')) {
                    word = wordsLeftSide[i].split('class="Translation_spTop_enTohe">');
                    word = word[1];
                    word = word.split("</span>");
                    word = word[0];
                }

                if (wordsLeftSide[i].includes('class="Translation_sp2Top_enTohe">')) {
                    word2 = wordsLeftSide[i].split('class="Translation_sp2Top_enTohe">');
                    word2 = word2[1];
                    word2 = word2.split("</span>");
                    word2 = word2[0];
                }

                if (wordsLeftSide[i].includes('class="Translation_div2center_enTohe">')) {
                    word3 = wordsLeftSide[i].split('class="Translation_div2center_enTohe">');
                    word3 = word3[1];
                    word3 = word3.split("</div>");
                    word3 = word3[0];
                }
            } else if (morfixCode.includes('row Translation_divTop_heToen')) {
                wordsLeftSide = morfixCode.split('row Translation_divTop_heToen');

                if (wordsLeftSide[i].includes('class="Translation_spTop_heToen">')) {
                    word = wordsLeftSide[i].split('class="Translation_spTop_heToen">');
                    word = word[1];
                    word = word.split("</span>");
                    word = word[0];
                }

                if (wordsLeftSide[i].includes('class="Translation_sp2Top_heToen">')) {
                    word2 = wordsLeftSide[i].split('class="Translation_sp2Top_heToen">');
                    word2 = word2[1];
                    word2 = word2.split("</span>");
                    word2 = word2[0];
                }

                if (word2.includes("&#39;")) {
                    word2 = word2.replace("&#39;", "'");
                }

            }



            var tbl = document.createElement('table');
            // tbl.style.width = '100%';
            // tbl.setAttribute('border', '1');
            var tbdy = document.createElement('tbody');
            var tr = document.createElement('tr');
            var td = document.createElement('td');
            var h3 = document.createElement('h3');
            h3.style.padding = "0px";
            h3.style.margin = "0px";
            h3.innerHTML = word;
            td.appendChild(h3);
            tr.appendChild(td);

            if (word2 != "") {
                var td1 = document.createElement('td');
                td1.append("(" + word2 + ")");
                td1.align = "left";
                tr.appendChild(td1);
            }
            tbdy.appendChild(tr);

            var tr1 = document.createElement('tr');
            var td2 = document.createElement('td');
            td2.colSpan = "2";
            td2.append(word3);
            tr1.appendChild(td2);
            tbdy.appendChild(tr1);

            tbl.appendChild(tbdy);
            document.getElementById("result").appendChild((tbl));


            var res = morfixCode.split('class="normal_translation_div">');
            res = res[i].split('</div>');
            var result = res[0];
            result.replace("<span class='clearOutputLanguageMeaningsString'>", "");
            result.replace("</span>", "");
            document.getElementById("result").innerHTML += "<h3>" + result + "</h3>";

        }
    } else {
        if (document.getElementById("result").innerHTML == "") {
            document.getElementById("result").innerHTML = "No dictionary translations found";
        }
    }

}


//--------------------------------------------------------------------------------------
chrome.tabs.executeScript({
    code: "window.getSelection().toString();"
}, function (selection) {
    if (selection != undefined && selection != "") {
        var text = "";
        chrome.tabs.getSelected(null, function (tab) {
            text += selection[0];
            document.getElementById("translateInput").value = text;
            translateFunction();
        });

    }
});
//--------------------------------------------------------------------------------------


function updateDefault() {
    var num = 1;
    var leadsRef = database.ref('/');
    leadsRef.once('value', function (snapshot) {
        var childData = snapshot.val();
        var keys = Object.keys(childData);
        for (var i = 0; i < keys.length; i++) {
            if (keys[i] == "Favourite" + String(num)) {
                num++;
            }
        }
        document.getElementById("addInput").value = "Favourite" + String(num);

    });
}


function createRow(name) {
    var tr = document.createElement('tr');

    var td1 = document.createElement('td');
    td1.align = "center";
    var h3 = document.createElement('h3');
    h3.innerHTML = name;
    td1.appendChild(h3);
    tr.appendChild(td1)

    var td2 = document.createElement('td');
    td2.align = "center";
    var saveBtn = document.createElement('button');
    // saveBtn.innerHTML = 'save';
    saveBtn.innerHTML = 'update';
    saveBtn.className = "save";
    saveBtn.setAttribute("name", name);
    saveBtn.onclick = function () {
        // alert(this.name);
        saveTabs(this.name);
    };
    td2.appendChild(saveBtn);
    tr.appendChild(td2)

    var td3 = document.createElement('td');
    td3.align = "center";
    var openBtn = document.createElement('button');
    openBtn.innerHTML = 'open';
    openBtn.className = "open";
    openBtn.setAttribute("name", name);
    openBtn.onclick = function () {
        // alert(this.name);
        openTabs(this.name);
    };
    td3.appendChild(openBtn);
    tr.appendChild(td3)

    var td4 = document.createElement('td');
    td4.align = "center";
    var showBtn = document.createElement('button');
    showBtn.innerHTML = 'show';
    showBtn.className = "show";
    showBtn.setAttribute("name", name);
    showBtn.onclick = function () {
        // alert(this.name);
        showTabs(this.name);
    };
    td4.appendChild(showBtn);
    tr.appendChild(td4)

    var td5 = document.createElement('td');
    td5.align = "center";
    // td5.width = "80px";
    var deleteBtn = document.createElement('button');
    deleteBtn.innerHTML = 'delete';
    deleteBtn.className = "delete";
    deleteBtn.setAttribute("name", name);
    deleteBtn.onclick = function () {
        // alert(this.name);
        deleteTabs(this.name);
    };
    td5.appendChild(deleteBtn);
    tr.appendChild(td5)

    return (tr);
}



function showTableBtns() {
    var leadsRef = database.ref('/');
    leadsRef.once('value', function (snapshot) {
        var childData = snapshot.val();
        var keys = Object.keys(childData);
        var tbl = document.getElementById("tableBtns");
        var tbdy = document.createElement('tbody');
        for (var i = 0; i < keys.length; i++) {
            tbdy.appendChild(createRow(keys[i]));
        }

        document.getElementById("tableBtns").innerHTML = "";
        tbl.appendChild(tbdy);
    });
}


document.getElementById("switchBtnLinks").addEventListener('change', function () {
    var isChecked = document.getElementById("switchBtnLinks").checked;
    var cols = document.getElementsByClassName('hiddenElements');
    var textDiv = document.getElementById('textDiv');
    var hiddenP = document.getElementById('hiddenP');
    if (isChecked) {
        textDiv.style.width = "530px";
        hiddenP.style.visibility = 'hidden';
        hiddenP.style.display = 'none';
        for (var i = 0; i < cols.length; i++) {
            cols[i].style.visibility = 'visible';
            cols[i].style.display = 'inline-block';
        }
        showTableBtns();
        updateDefault();
    } else {
        textDiv.style.width = "340px";
        hiddenP.style.visibility = 'visible';
        hiddenP.style.display = 'inline-block';
        for (var i = 0; i < cols.length; i++) {
            cols[i].style.visibility = 'hidden';
            cols[i].style.display = 'none';
        }
        document.getElementById("tableBtns").innerHTML = "";
    }
});



document.getElementById("translateBtn").addEventListener('click', function () {
    translateFunction();
});



function saveTabs(name) {
    var ref = database.ref(name);
    var arr = [];
    chrome.tabs.getAllInWindow(null, function (tabs) {
        for (var i = 0; i < tabs.length; i++) {
            arr.push(String(tabs[i].url));
        }
        var data = {};
        for (var i = 0; i < arr.length; i++) {
            data['link' + String(i)] = arr[i];
        }
        ref.set(data);
    });

    showTabs(name);
}


function openTabs(name) {
    // alert("Open");
    var leadsRef = database.ref(name);
    leadsRef.once('value', function (snapshot) {
        var childData = snapshot.val();
        var keys = Object.keys(childData);
        for (var i = 0; i < keys.length; i++) {
            var currentLink = childData[keys[i]];
            chrome.tabs.create({
                url: currentLink
            });
        }
    });
}


function showTabs(name) {
    document.getElementById("textSpan").innerHTML = name + ": ";
    var leadsRef = database.ref(name);
    leadsRef.once('value', function (snapshot) {
        var childData = snapshot.val();
        var keys = Object.keys(childData);
        // var text = "";
        var testDiv = document.getElementById("testDiv");
        testDiv.innerHTML = "";
        var tbl = document.createElement('table');
        tbl.setAttribute('border', '1');
        var tbdy = document.createElement('tbody');

        for (var i = 0; i < keys.length; i++) {
            var currentLink = childData[keys[i]];
            var tr = document.createElement('tr');
            var td = document.createElement('td');
            td.align = "center";
            var a = document.createElement('a');
            a.href = currentLink;
            a.innerHTML = currentLink;
            a.target = "_blank";
            td.appendChild(a);
            tr.appendChild(td)
            tbdy.appendChild(tr);
        }
        tbl.appendChild(tbdy);
        testDiv.appendChild(tbl);
    });
}


function deleteTabs(name) {
    var str = document.getElementById("textSpan").innerHTML;
    if (str != "") {
        if (str.substring(0, str.length - 2) == name) {
            document.getElementById("textSpan").innerHTML = "";
            var testDiv = document.getElementById("testDiv");
            testDiv.innerHTML = "";
        }
    }
    var ref = database.ref(name);
    ref.remove();
    showTableBtns();
}


document.getElementById("addBtn").addEventListener('click', function () {
    var name = document.getElementById("addInput").value;
    if (name == "") {
        alert("Enter a name");
    } else {
        var exists = false;
        var leadsRef = database.ref('/');
        leadsRef.once('value', function (snapshot) {
            var childData = snapshot.val();
            var keys = Object.keys(childData);
            // alert(keys);
            for (var i = 0; i < keys.length; i++) {
                if (keys[i] == name) {
                    if (confirm("You already have a set with the name " + name + "\n Do you want to replace it?")) {
                        saveTabs(name);
                    }

                    exists = true;
                    break;
                }
            }

            if (exists == false) {
                var tbl = document.getElementById("tableBtns");
                tbl.appendChild(createRow(name));
                saveTabs(name);
            }
            updateDefault();
        });
    }

});
