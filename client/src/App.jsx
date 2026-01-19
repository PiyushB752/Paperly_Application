import React, { useState, useEffect, useRef } from 'react';
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Strike from '@tiptap/extension-strike'
import { TextAlign } from '@tiptap/extension-text-align'
import { Placeholder } from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { EditorContent, useEditor } from '@tiptap/react'
import './App.css';

function App(){
  const page_width = 816
  const page_height = 1056
  const margin = 96
  const content_width = page_width - margin * 2
  const content_height = page_height - margin * 2

  const [content,setContent] = useState("")
  const [isPreview,setIsPreview] = useState(false)
  const [previewPages,setPreviewPages] = useState([])
  const previewContainerRef = useRef(null)

  const editor = useEditor({
    extensions:[
      StarterKit,
      Underline,
      Strike,
      TextAlign.configure({
        types:["heading","paragraph"],
      }),
      Placeholder.configure({
        placeholder:"Start typing your document here...",
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'document-table',
        },
      }),
      TableRow.configure({
        HTMLAttributes: {
          class: 'table-row',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'table-header',
        },
      }),
      TableCell.configure({
        HTMLAttributes: {
          class: 'table-cell',
        },
      }),
    ],
    content:"",
    editorProps: {
      attributes: {
        class: 'editor-content',
        style: 'outline: none;',
      },
    },
  })

  useEffect(() => {
    if (!editor) return

    const handleUpdate = () => {
      const html = editor.getHTML()
      setContent(html)
    }

    editor.on('update',handleUpdate)
    
    return ()=>{
      editor.off('update',handleUpdate)
    }
  },[editor])

  const splitContentByHeight=(htmlContent)=>{
    if (!htmlContent || htmlContent.trim()===""){
      return ['<p class="placeholder-text">Document is empty. Switch to Edit mode to start writing.</p>']
    }

    const pages = []
    const parser = new DOMParser()
    const doc = parser.parseFromString(htmlContent,"text/html")
    const elements = Array.from(doc.body.children)
    
    let currentPageElements = []
    let currentHeight = 0
    
    const tempDiv = document.createElement('div')
    tempDiv.style.width = content_width + 'px'
    tempDiv.style.fontFamily = 'Inter, system-ui, sans-serif'
    tempDiv.style.fontSize = '14pt'
    tempDiv.style.lineHeight = '1.6'
    tempDiv.style.padding = '0'
    tempDiv.style.margin = '0'
    tempDiv.style.visibility = 'hidden'
    tempDiv.style.position = 'absolute'
    tempDiv.style.left = '-9999px'
    
    const tableStyles = `
      .document-table {
        border-collapse: collapse;
        width: 100%;
        margin: 1em 0;
        table-layout: fixed;
      }
      .document-table th, .document-table td {
        border: 1px solid #d1d5db;
        padding: 8px 12px;
        min-width: 60px;
      }
      .document-table th {
        background-color: #f9fafb;
        font-weight: 600;
      }
    `
    
    for (const ele of elements) {
      const clonedElement = ele.cloneNode(true)
      tempDiv.innerHTML = ''
      
      const style = document.createElement('style')
      style.textContent = tableStyles
      tempDiv.appendChild(style)
      
      tempDiv.appendChild(clonedElement)
      document.body.appendChild(tempDiv)
      
      const elementHeight = tempDiv.offsetHeight
      document.body.removeChild(tempDiv)
      
      if (elementHeight > content_height && currentHeight===0){
        pages.push(ele.outerHTML)
        continue
      }
      
      if (currentHeight + elementHeight > content_height && currentHeight > 0) {
        pages.push(currentPageElements.map(el => el.outerHTML).join(''))        
        currentPageElements = [ele]
        currentHeight = elementHeight
      } else {
        currentPageElements.push(ele)
        currentHeight += elementHeight
      }
    }
    
    if (currentPageElements.length > 0){
      pages.push(currentPageElements.map((e)=>e.outerHTML).join(''))
    }
    
    return pages.length > 0 ? pages : ['<p>Start typing...</p>']
  }

  useEffect(() => {
    if (isPreview && content) {
      const pages = splitContentByHeight(content)
      setPreviewPages(pages)
    }
  },[isPreview,content])

  const insertTable=()=>{
    editor.chain().focus().insertTable({rows:3,cols:3,withHeaderRow:true}).run()
  }

  const addColumn=()=>{
    editor.chain().focus().addColumnAfter().run()
  }

  const addRow=()=>{
    editor.chain().focus().addRowAfter().run()
  }

  const deleteTable=()=>{
    editor.chain().focus().deleteTable().run()
  }

  const handlePrint=()=>{
    const printWindow = window.open('','_blank')
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Document Print</title>
        <style>
          @page{
            size: letter;
            margin: 1in;
          }
          body{
            font-family: Inter, system-ui, sans-serif;
            font-size: 14pt;
            line-height: 1.6;
            margin: 0;
            padding: 0;
          }
          .print-page{
            width: 8.5in;
            height: 11in;
            page-break-after: always;
            padding: 96px;
            box-sizing: border-box;
          }
          .print-page:last-child{
            page-break-after: auto;
          }
          .document-table {
            border-collapse: collapse;
            width: 100%;
            margin: 1em 0;
          }
          .document-table th, .document-table td {
            border: 1px solid #d1d5db;
            padding: 8px 12px;
            text-align: left;
          }
          .document-table th {
            background: #f9fafb;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        ${previewPages.map((pageHtml,i) => `
          <div class="print-page">
            ${pageHtml}
          </div>
        `).join('')}
      </body>
      </html>
    `)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    },250)
  }

  if (!editor) {
    return null
  }

  return (
    <div className='app'>
      <div className='toolbar'>
        <div className='tool_group'>
          <div className='tool_label'>View</div>
          <div className='tool_buttons'>
            <button onClick={()=>setIsPreview(false)} className={!isPreview ? 'active' : ''}>Edit</button>
            <button onClick={()=>setIsPreview(true)} className={isPreview ? 'active' : ''}>Preview</button>
          </div>
        </div>

        <div className='divider' />

        {!isPreview && (
          <>
            <div className='tool_group'>
              <div className='tool_label'>History</div>
              <div className='tool_buttons'>
                <button onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>⟲ Undo</button>
                <button onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>⟳ Redo</button>
              </div>
            </div>

            <div className='divider' />

            <div className='tool_group'>
              <div className='tool_label'>Text</div>
              <div className='tool_buttons'>
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'active' : ''}><b>B</b></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'active' : ''}><i>I</i></button>
                <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={editor.isActive('underline') ? 'active' : ''}><u>U</u></button>
                <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'active' : ''}><s>S</s></button>
              </div>
            </div>

            <div className='divider' />

            <div className='tool_group'>
              <div className='tool_label'>Style</div>
              <div className='tool_buttons'>
                <button onClick={() => editor.chain().focus().setParagraph().run()} className={editor.isActive('paragraph') ? 'active' : ''}>Normal</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={editor.isActive('heading', { level: 1 }) ? 'active' : ''}>H1</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={editor.isActive('heading', { level: 2 }) ? 'active' : ''}>H2</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={editor.isActive('heading', { level: 3 }) ? 'active' : ''}>H3</button>
                <button onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()} className={editor.isActive('heading', { level: 4 }) ? 'active' : ''}>H4</button>
              </div>
            </div>

            <div className='divider' />

            <div className='tool_group'>
              <div className='tool_label'>Table</div>
              <div className='tool_buttons'>
                <button onClick={insertTable}>Add Table</button>
                <button onClick={addColumn} disabled={!editor.can().addColumnAfter()}>Add Col</button>
                <button onClick={addRow} disabled={!editor.can().addRowAfter()}>Add Row</button>
                <button onClick={deleteTable} disabled={!editor.can().deleteTable()}>Delete</button>
              </div>
            </div>

            <div className='divider' />

            <div className='tool_group'>
              <div className='tool_label'>Text Align</div>
              <div className='tool_buttons'>
                <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={editor.isActive({ textAlign: 'left' }) ? 'active' : ''}>⬅ Left</button>
                <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={editor.isActive({ textAlign: 'center' }) ? 'active' : ''}>⬍ Center</button>
                <button onClick={()=>editor.chain().focus().setTextAlign('right').run()} className={editor.isActive({ textAlign: 'right' }) ? 'active' : ''}>➡ Right</button>
              </div>
            </div>

            <div className='divider' />

            <div className='tool_group'>
              <div className='tool_label'>Lists</div>
              <div className='tool_buttons'>
                <button
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={editor.isActive('bulletList') ? 'active' : ''}>• Bulleted</button>
                <button onClick={() => editor.chain().focus().toggleOrderedList().run()}className={editor.isActive('orderedList') ? 'active' : ''}>1. Numbered</button>
              </div>
            </div>
          </>
        )}
        {isPreview && (
          <div>
            <div className='tool_group'>
              <div className='tool_label'>Export</div>
              <div className='tool_buttons'>
                <button onClick={handlePrint} className='print_button'>
                  Print/PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className='editor_wrapper' ref={previewContainerRef}>
        {!isPreview ? (
          <div className='edit_mode'>
            <div className='page_sheet' style={{width:page_width,height:page_height}}>
              <div className='page_content' style={{width: content_width,height: content_height,margin: margin}}>
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>
        ):(
          <div className='preview_mode'>
            {previewPages.length===0 ? (
              <div className='no_content'>No content to preview. Switch to Edit mode to write.</div>
            ):(
              <div className='pages_container'>
                {previewPages.map((pageHtml,i) => (
                  <div key={i} className='preview_page_container'>
                    <div className='page_sheet preview_page' style={{width:page_width,height:page_height}}>
                      <div className='page_content_wrapper'>
                        <div className='page_content preview_content_area' style={{width:content_width,height:content_height,margin:margin}}>
                          <div className='preview_html_content' dangerouslySetInnerHTML={{ __html:pageHtml}} />
                        </div>
                      </div>
                    </div>
                    {i<previewPages.length-1 && (
                      <div className='page_break_indicator' />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default App;