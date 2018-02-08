function Application(props) {
	return <div className="profile">
		<h1>Profile</h1>
	</div>
}

Application.propTypes = {
	title: React.PropTypes.string	
};

ReactDOM.render(<Application title="Profile" />, document.getElementById('container'));