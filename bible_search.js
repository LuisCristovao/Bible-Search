async function readBiBle(){
    let data = await fetch("/bible_data/PT/biblia.json")
    return await data.json()
    
}

var bible_data;
window.onload = async ()=>{
    bible_data=await readBiBle()
    let books=bible_data//.filter((book,index)=> index < 10)
    let html=""
    books.forEach((book,index)=>{

        html+=`<h1>Livro ${index+1} ${book.name}</h1>`
        book.chapters.forEach((chapter,index) => {
            html+=`<h2>Capítulo ${index+1}</h2>`
            chapter.forEach((verse,index)=>{
                html+=`<p>${index+1}: ${verse}</p>`
            })
        });
    })
    document.body.innerHTML=html
}