"use strict"

import React from 'react'
import ReactDOM from 'react-dom'
// import '../../common'
import logo from './images/logo.jpg'
import { a } from './tree-shaking'
import './search.less'

// if(false) {
//     a()
// }

class Search extends React.Component {

    constructor() {
        super(...arguments)

        this.state = {
            Text: null
        }
    }

    loadComponent() {
        import ('./text.js').then((Text) => {
            this.setState({
                Text: Text.default
            })
        })
    }

    render() {
        // const funcA = a()
        const { Text } = this.state
        return <div className="search-text">
            {
                Text ? <Text/> : null
            }
            Search Text  修改  二次修改 <img src={ logo } onClick={ this.loadComponent.bind(this) } />
        </div>
    }
}

ReactDOM.render(
    <Search/>,
    document.getElementById('root')
)