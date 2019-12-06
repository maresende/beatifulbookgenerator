import React from 'react';
import Request from 'request';
import Sanitize from 'sanitize-html'
import './App.css';
import Css from 'css';

class App  extends React.Component {

  constructor(props){
    super(props);
    this.state = {
      content : ''
    }
  }


  componentDidMount(){


    var link = window.location.href.split("/") //esta parte precisa ser melhorada


    var link_docs = "https://docs.google.com/document/d/e/" + link[3] + "/pub" 

    if(link[3]){
    Request.get({url: link_docs, encoding: 'utf-8', followRedirect: false}, (error, response, body) => {
      if(response === undefined){
          alert('Ops, alguma coisa deu errado. Tente utilizar ctrl + f5');
          return null;
      }
      if (response.statusCode >= 300) {
          return null;
      }

        
      var processHTML = function(html) {
        return html
        .replace(/<a\s/ig, '<a target="_blank" ')
        .replace(/(<script[\s\S]+?<\/script>)/gi, '')
        .replace(/(<div id="header">[\s\S]+?<\/div>)/, '')
        .replace(/(<div id="footer">[\s\S]+?<\/div>)/, '')
        .replace(/((<title>[\s\S]+?<\/title>))/,'')
      };

      var HTML = processHTML(body)

      var temp = this.state;
      temp.content = HTML;

      var parsedHtml = document.createElement('html');
      parsedHtml.innerHTML = HTML;

      var aux2 = parsedHtml.getElementsByTagName("style").item(0);
      aux2.parentElement.innerHTML =''
      
      var raw_css_text = parsedHtml.getElementsByTagName("style").item(0).innerHTML;
      parsedHtml.getElementsByTagName("style").item(0).innerHTML = '';
    
      //change ccs for AST
      var ParsedCss = Css.parse(raw_css_text);

      for(var i=0; i < ParsedCss.stylesheet.rules.length; i++){
        //if(ParsedCss.stylesheet.rules[i].selectors !== undefined){
        // console.log(ParsedCss.stylesheet.rules[i].selectors[0]);
       // }
      
        if(ParsedCss.stylesheet.rules[i].declarations === undefined){
            continue
        }
        for(var j=0; j < ParsedCss.stylesheet.rules[i].declarations.length; j++){
        //  console.log('   ');
            if(ParsedCss.stylesheet.rules[i].declarations[j].property === "font-weight"){
                if(ParsedCss.stylesheet.rules[i].declarations[j].value === "700"){
                //  console.log(ParsedCss.stylesheet.rules[i].selectors);
                  var listOfBolds = ParsedCss.stylesheet.rules[i].selectors;
                  for(var k = 0; k < listOfBolds.length; k++){
                      var classstring = listOfBolds[k].substr(1)
                      var elements = parsedHtml.getElementsByClassName(classstring);
                      for(var l = 0; l < elements.length; l++){
                      //  console.log(elements[l])
                        elements[l].innerHTML = "<b>" + elements[l].innerHTML + "</b>"
                      }
                  }
                }
            }
            if(ParsedCss.stylesheet.rules[i].declarations[j].property === "text-align"){
                  if(ParsedCss.stylesheet.rules[i].declarations[j].value === "left"){
                  continue
                  }
                // console.log(ParsedCss.stylesheet.rules[i].selectors);
                  var listOfAlign = ParsedCss.stylesheet.rules[i].selectors;
                  for(k = 0; k < listOfAlign.length; k++){
                      classstring = listOfAlign[k].substr(1)
                      elements = parsedHtml.getElementsByClassName(classstring);
                      for(l = 0; l < elements.length; l++){
                      //  console.log(elements[l])
                        elements[l].setAttribute("style", " text-align : " + ParsedCss.stylesheet.rules[i].declarations[j].value );
                      }
                  }
            }

            if(ParsedCss.stylesheet.rules[i].declarations[j].property === "font-style"){
                if(ParsedCss.stylesheet.rules[i].declarations[j].value === "italic"){
              //   console.log(ParsedCss.stylesheet.rules[i].selectors);
                  listOfAlign = ParsedCss.stylesheet.rules[i].selectors;
                  for(k = 0; k < listOfAlign.length; k++){
                      classstring = listOfAlign[k].substr(1)
                      elements = parsedHtml.getElementsByClassName(classstring);
                      for(l = 0; l < elements.length; l++){
                        //console.log(elements[l])
                        elements[l].innerHTML = "<i>" + elements[l].innerHTML + "</i>"
                      }
                  }
              }
            }

      }
      }
      
      //console.log(parsedHtml.children.item(1))
      
      parsedHtml.getElementsByTagName('div').item(0).classList.add("col-md-offset-1")

      var listoftable = parsedHtml.getElementsByTagName("table");
      var titles = parsedHtml.getElementsByClassName("title")

      for(var q = 0; q < titles.length;q++){
        titles[q].innerHTML = Sanitize(titles[q].innerHTML);
        titles[q].innerHTML = "<p style='font-size:36px'>" + titles[q].innerHTML + "</p>"
      }
      
      for(i = 0; i < listoftable.length; i++){

          var table = listoftable[i]         
          table.className = ""
          var table_body = table.getElementsByTagName("tbody")[0]
          var header_old = table_body.getElementsByTagName("tr")[0];
          titles = header_old.getElementsByTagName("td");
          var header_new = document.createElement("thead");
          var line_new = document.createElement("tr");
          header_new.appendChild(line_new);
          var listTitles = [];
          if(table.getElementsByTagName('tr').length > 1){
            for(j=0;j < titles.length; j++){
              var pTag = titles[j].children
            
              var spanTag = pTag[0].children[0]
              var column_new = document.createElement("th");
              var atributes  = titles[j].getAttribute('colspan')
              if(atributes !== undefined){
                  column_new.setAttribute('colspan', atributes);
              }
              atributes  = titles[j].getAttribute('rowspan')
              if(atributes !== undefined)
              {
                  column_new.setAttribute('rowspan', atributes);
              }
              column_new.setAttribute("data-label", spanTag.innerHTML);

              //sanitizar este titles[j].innerHTML

              titles[j].innerHTML = Sanitize(titles[j].innerHTML)

              column_new.innerHTML = titles[j].innerHTML;
              var  innerText = spanTag.children[0];
              if(innerText !== undefined){
                listTitles.push(innerText.innerHTML); 
              } 
              else{
                listTitles.push(spanTag.innerHTML);
              }
              line_new.appendChild(column_new);
            }
          table_body.removeChild(header_old)
          table.insertBefore(header_new, table_body)
          }
          else{
            table.innerHTML = Sanitize(table.innerHTML, {
                allowedTags: Sanitize.defaults.allowedTags.concat([ 'img', 'h1', 'h2', 'h3', 'h4', 'style']),
                allowedAttributes: {
                a: ['href', 'name', 'target'],
                div: ['class' ],
                style: ['*'],
                ol: ['start'],
                td:['data-label', 'colspan', 'rowspan'],
                th:['data-label', 'rowspan', 'colspan'],
                p: ['style'],
                iframe: [ '*'],
                img: ['*']
              },
            });
            table.innerHTML = table.innerHTML.replace(/(<p><\/p>)/gi,"")
            table.classList.add("code");
           // table.innerHTML = table.innerHTML.replace(/(&nbsp;)/gi," ")
          }

        //  table.insertAdjacentElement('beforebegin', myFrame);
          
      }
    


      var tables = parsedHtml.getElementsByTagName("table");
      for (i=tables.length-1; i>=0;i-=1){

      }

      parsedHtml.innerHTML = parsedHtml.innerHTML
        //.replace(/(&nbsp;)/gi, " ")
        .replace(/(<i><\/i>)/gi, "")
        .replace(/(<b><\/b>)/gi, "")
  
      var sanitized_html =  Sanitize(parsedHtml.innerHTML, {
          allowedTags: Sanitize.defaults.allowedTags.concat([ 'img', 'h1', 'h2', 'h3', 'h4', 'style']),
          allowedAttributes: {
              a: ['href', 'name', 'target'],
              div: ['class' ],
              style: ['*'],
              ol: ['start'],
              table:['class'],
              td:['data-label', 'colspan', 'rowspan'],
              th:['data-label', 'rowspan', 'colspan'],
              p: ['style'],
              iframe: [ '*'],
              img: ['*']
            },
      });

      sanitized_html = sanitized_html.replace(/(<p><\/p>)/gi,'');

      //bota no estado da página o html gerado
      temp.content = sanitized_html; 

      //seta o estado da página 
      this.setState({temp})
      }).end()
    }
     
    if(this.state.content === ''){
      var temp = this.state;
      temp.content = '<p>Aguarde um pouco enquanto o livro é carregado.</p>'
      this.setState({temp})
    }
    

  }


    render(){
      return (
          <div className="row cols-sm-12 cols-md-10" dangerouslySetInnerHTML = {{__html: this.state.content }} />
      );
    }
}

export default App;
