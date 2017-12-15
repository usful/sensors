import React, { Component } from 'react';
import { render } from 'react-dom';
import Lex from './Lex';

class AmazonApiApp extends Component {
  constructor(props){
    super(props);
    this.state = {
      view: null
    }
  }

  render() {
    //For now since I only have the one amazon example I am doing this
    return(<Lex />);

    
    /**if (!this.state.view) {
      const clickFuncGen = viewName => () => {this.setState({view: viewName})};
      return (
        <div>
          <h1>
            Start Page
          </h1>
          <li>
            <button onClick={clickFuncGen('Lex')}> Amazon Lex Example </button>
          </li>
        </div>
      );
    }
    switch(this.state.view) {
      case 'Lex':
        return(<Lex />);
      break;
      default :
        return(<div>Error, page not recognized</div>);
    }
 */
  }
}

render(<AmazonApiApp/>, document.getElementById('container'))
