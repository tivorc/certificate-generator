import { jsPDF } from "jspdf";
import XLSX from "xlsx";
import logo from "../images/logo_no_shadow.png";
import text from "../images/text_no_shadow.png";
import ugel from "../images/ugel_logo.jpg";

const btn = document.getElementById("btn");
const file = document.getElementById("file");

btn.addEventListener("click", handleClick);

async function handleClick() {
  try {
    const xlsxFile = await readFileAsync(file.files[0]);
    const dataList = readExcel(xlsxFile);
    const doc = await makePDF(dataList);
    doc.save("certificados.pdf");
  } catch (error) {
    alert(error.message);
  }
}

function readFileAsync(file) {
  return new Promise(function (resolve, reject) {
    const reader = new FileReader();

    reader.onload = function (e) {
      resolve(e.target.result);
    };
    reader.onerror = reject;
    reader.readAsBinaryString(file);
  });
}

function readExcel(xlsxFile) {
  const workbook = XLSX.read(xlsxFile, { type: "binary" });
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  if (worksheet["A1"].v !== "type [1]") {
    console.log("error");
    throw new Error("Formato incorrecto");
  }

  let readEnd = false,
    rowNumber = 2,
    dataList = [];
  while (!readEnd) {
    const type = worksheet[`A${rowNumber}`];
    const student = worksheet["B" + rowNumber];
    const description = worksheet["C" + rowNumber];
    const date = worksheet["D" + rowNumber];

    let data = [type, student, description, date];
    if (data.every((v) => !v)) {
      readEnd = true;
      continue;
    }

    const row = {
      type: type.v,
      student: student.v,
      description: description.v,
      date: date.v,
    };
    dataList.push(row);
    rowNumber++;
  }
  return dataList;
}

async function makePDF(data) {
  const doc = new jsPDF({
    orientation: "landscape",
  });

  const height = 210,
    width = 297,
    margin = 10;
  const gold = [250, 174, 0],
    wine = [158, 25, 21];

  const [schoolLogo, schoolText, ugelLogo] = await Promise.all([
    getDataUri(logo),
    getDataUri(text),
    getDataUri(ugel),
  ]);

  data.forEach((students, i) => {
    const { type, student: name, description, date } = students;

    if (i !== 0) {
      doc.addPage();
    }

    // colors
    doc.setFillColor(...gold);
    doc.triangle(0, 0, 0, 140, 30, 0, "F");
    doc.setFillColor(...wine);
    doc.triangle(0, 210, 40, 210, 0, 90, "F");

    doc.setTextColor("gray");

    // images
    doc.addImage(schoolLogo, "png", 30, 10, 17, 20, "XD", "FAST");
    doc.addImage(schoolText, "png", width / 2 - 27, 17, 54, 11);
    doc.addImage(ugelLogo, "jpg", width - 30 - 25, margin, 25, 19);

    // institution name
    doc.setFontSize(14);
    doc.myText(
      "Institución Educativa Privada",
      { align: "center" },
      0,
      margin + 5
    );

    doc.myText("Otorgado a:", { align: "center" }, 0, height / 2 - 20);

    doc.setFontSize(22);
    doc.myText(type, { align: "center" }, 0, 60);
    doc.setFontSize(30);
    doc.setFont("helvetica", "bold");
    doc.setTextColor("black");
    doc.myText(name, { align: "center" }, 0, height / 2 - 1);
    doc.line(60, height / 2, width - 60, height / 2);
    doc.setFont("helvetica", "normal");
    doc.setTextColor("gray");

    doc.setFontSize(18);
    doc.myText(description, { align: "center" }, 0, 120);

    const signWidth = 28;
    const x1 = width / 4;
    doc.line(x1 - signWidth, 180, x1 + signWidth, 180);
    doc.line(width - (x1 - signWidth), 180, width - (x1 + signWidth), 180);
    doc.setFontSize(14);
    doc.setFont("helvetica", "italic");
    doc.text("Chao, " + date, width - 110, 155);
    doc.myText("Victor Gil Otiniano", { align: "center2" }, 0, 185);
    doc.myText("Segundo Bringas Villa", { align: "center3" }, 0, 185);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.myText("Promotor", { align: "center2" }, 0, 190);
    doc.myText("Director", { align: "center3" }, 0, 190);
  });

  return doc;
}

function getDataUri(url) {
  return new Promise((resolve) => {
    var image = new Image();
    image.setAttribute("crossOrigin", "anonymous");

    image.onload = function () {
      var canvas = document.createElement("canvas");
      canvas.width = this.naturalWidth;
      canvas.height = this.naturalHeight;

      var ctx = canvas.getContext("2d");
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      canvas.getContext("2d").drawImage(this, 0, 0);

      resolve(canvas.toDataURL("image/jpeg"));
    };

    image.src = url;
  });
}

// center text
(function (API) {
  API.myText = function (txt, options, x, y) {
    options = options || {};

    if (options.align == "center") {
      var fontSize = this.internal.getFontSize();
      var pageWidth = this.internal.pageSize.width;

      const txtWidth =
        (this.getStringUnitWidth(txt) * fontSize) / this.internal.scaleFactor;

      x = (pageWidth - txtWidth) / 2;
    }

    if (options.align == "center2") {
      var fontSize = this.internal.getFontSize();
      var pageWidth = this.internal.pageSize.width;

      const txtWidth =
        (this.getStringUnitWidth(txt) * fontSize) / this.internal.scaleFactor;

      x = pageWidth / 4 - txtWidth / 2;
    }

    if (options.align == "center3") {
      var fontSize = this.internal.getFontSize();
      var pageWidth = this.internal.pageSize.width;

      const txtWidth =
        (this.getStringUnitWidth(txt) * fontSize) / this.internal.scaleFactor;

      x = pageWidth - pageWidth / 4 - txtWidth / 2;
    }

    this.text(txt, x, y);
  };
})(jsPDF.API);
