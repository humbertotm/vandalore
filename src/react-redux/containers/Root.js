import React, { Component } from 'react'
import { Provider } from 'react-redux'
// import whateverNameIGiveToStore from '/store/path'
import App from './App'

// const store = whateverNameIGiveToStore()
// history = syncHistoryWithStore(browserHistory, store)

export default class Root extends Component {
	render() {
		return(
			<Provider store={store}>
				<Router history={history}>
					<Route path="/" component={App}>
						<IndexRoute 
							component={() => (<Home someProp="value" />)} 
							// Make sure this executes before componentDidMount()
							// in Home component.
							onEnter=(dispatch(updateCurrentGallery('home'))) />
						<Route path="/fresh" component={Home
							onEnter=(dispatch(updateCurrentGallery('fresh')))} />
						<Route path="/:category" component={Category}
							onEnter=(dispatch(updateCurrentGallery('category in url'))) />
						// This route will be protected by wrapping it with
						// redux-auth-wrapper.
						<Route path="/feed/:userName" component={Feed} />
						<Route path="/users/:userName" component={Profile}>
							<Route path="/users/:userName/voted" component={VotedPosts} />
							// This route will be protected by wrapping it with
							// redux-auth-wrapper.
							<Route path="/users/:userName/settings" component={Settings} />
						</Route>
						<Route path="posts/:postId" component={SinglePost} />
					</Route>
				</Router>
			</Provider>
		)
	}
}