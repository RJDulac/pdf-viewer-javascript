//can be external
const url = "../pdf/pdf.pdf";

let pdfDoc = null,
  pageNum = 1,
  pageIsRender = false,
  pageNumIsPending = null;

const scale = 1.5,
  canvas = document.getElementById("pdf-render"),
  ctx = canvas.getContext("2d");

//render page
const renderPage = num => {
  pageIsRender = true;

  //get page
  pdfDoc.getPage(num).then(page => {
    //set scale
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
      canvasContext: ctx,
      viewport
    };
    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });
    //output current page
    document.getElementById("page-num").textContent = num;
  });
};
// check for pages rendering
const queueRenderPage = num => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};
//show previous page
const showPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};
//show next page
const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};
//get pdf
pdfjsLib
  .getDocument(url)
  .promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;

    document.getElementById("page-count").textContent = pdfDoc.numPages;
    renderPage(pageNum);
  })
  .catch(err => {
    //display error by creating a div
    const div = document.createElement("div");
    div.className = "error";
    div.appendChild(document.createTextNode(err.message));
    //insert element before div and canvas
    document.getElementsByTagName("body")[0].insertBefore(div, canvas);
    //remove top bar
    document.getElementsByClassName("top-bar")[0].style.display = "none";
  });

//button events
document.getElementById("prev-page").addEventListener("click", showPrevPage);
document.getElementById("next-page").addEventListener("click", showNextPage);
