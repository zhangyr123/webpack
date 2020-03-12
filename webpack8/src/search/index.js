"use strict"

import React from 'react'
import ReactDOM from 'react-dom'
// import '../../common'
import logo from './images/logo.jpg'
import largeNumber from 'webpack7'
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

        let addResult = largeNumber('999', '1')
        return <div className="search-text">
            {
                Text ? <Text/> : null
            }
            {
                addResult
            }
            Search Text 21 修改 二次修改 <img src={ logo } onClick={ this.loadComponent.bind(this) } />
        </div>
    }
}

ReactDOM.render(
    <Search/>,
    document.getElementById('root')
)