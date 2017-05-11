import React, { Component, PropTypes } from 'react'
import Link from 'react-router'
import SearchBar from '../forms/SearchBar'

export default class NavBar extends Component {
	render() {
		return (
			<div>
				<div className="leftSide">
					<img src="logo-url"/>
					<div className="dropdown">
						<Link to="/tattoo">Tattoo<Link />
						<Link to="/urban">Urban<Link />
						<Link to="/photography">Photography<Link />
						<Link to="/painting">Painting<Link />
						<Link to="/illustration">Illustration<Link />
						<Link to="/design">Design<Link />
						<Link to="/other">Other<Link />
					</div>
					<div>
						<h3>Hot</h3>
					</div>
					<div>
						<h3>Fresh</h3>
					</div>
				</div>

				<div className="searchBar">
					<SearchBar />
				</div>

				<div className="rightSide">
					{
						currentUser && <CurrentUserNavBar />
					}

					{
						!currentUser && <NoCurrentUserNavBar />
					}
				</div>
			</div>
		)
	}
}
