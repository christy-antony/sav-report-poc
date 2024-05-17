import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import * as jspdf from 'jspdf';


function App() {
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  useEffect(() => {
    const fetchHtmlContent = async () => {
      try {
        const response = await fetch('http://localhost:5149/api/Templates/template1.html');
        if (!response.ok) {
          throw new Error('Failed to fetch HTML content');
        }
        const htmlData = await response.text();
        setHtmlContent(htmlData);
        setLoading(false);
      } catch (error) {
        setError(error);
        setLoading(false);
      }
    };

    fetchHtmlContent();
  }, []); 

  const resetForm = () => {
    const form = document.getElementById('userForm');
    form.reset();
    const previewContainer = document.getElementById('previewContainer');
    previewContainer.innerHTML = '';
  };

  const showPreview = () => {
    const form = document.getElementById('userForm');
    const formClone = form.cloneNode(true);

    formClone.querySelectorAll('button').forEach(button => button.remove());
    formClone.querySelectorAll('input[type="button"]').forEach(button => button.remove());

    formClone.querySelectorAll('input').forEach(input => {
      const value = input.value;
      const span = document.createElement('span');
      span.textContent = value;
      const label = input.previousElementSibling.cloneNode(true);

      const div = document.createElement('div');
      div.appendChild(label);
      div.appendChild(span);

      input.parentElement.replaceWith(div);
    });

    const previewWindow = window.open('', 'Form Preview', 'width=600,height=400');
    previewWindow.document.open();
    previewWindow.document.write('<html><head><title>Form Preview</title>');
    previewWindow.document.write('<style>body { font-family: Arial, sans-serif; margin: 0; padding: 20px; box-sizing: border-box; } form { max-width: 400px; margin: 20px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; } label { display: block; margin-bottom: 5px; } span { display: block; padding: 8px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; } img { width: 100px; height: 100px; padding: 0 0 15px 0; }</style></head><body>');
    previewWindow.document.write('<h2>Form Preview</h2>');
    previewWindow.document.write(formClone.outerHTML);
    previewWindow.document.write('</body></html>');
    previewWindow.document.close();
  };


  const exportToPdf = () => {
    const element = document.getElementById('contentToExport');

    html2canvas(element)
      .then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jspdf.jsPDF();
        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('exported_file.pdf');
      })
      .catch(error => {
        console.error('Error exporting to PDF:', error);
      });
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const form = document.getElementById('userForm');
    const formData = new FormData(form);
    const formObject = {};
    formData.forEach((value, key) => {
      formObject[key] = value;
    });

    console.log( JSON.stringify(formObject, null, 2))
    setSubmittedData(formObject);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return (
    
    <div style={{marginBottom: '20px', textAlign: 'center'}}>
      <div id="contentToExport" dangerouslySetInnerHTML={{ __html: htmlContent }} />
      <button  onClick={exportToPdf} style={{margin: '5px', backgroundColor: '#007bff', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Export as PDF</button>
     
      <button type="button" onClick={handleSubmit} style={{ margin: '5px', backgroundColor: '#007bff', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Submit</button>
      <button type="button" onClick={resetForm} style={{margin: '5px', backgroundColor: '#007bff', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Reset</button>
      <button type="button" onClick={showPreview} style={{margin: '5px', backgroundColor: '#007bff', color: '#fff', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer'}}>Preview</button>
    </div>
    
  );
}

export default App;
