import React, { useState, useEffect } from 'react'

function Redirect(props) {
	useEffect(() => {
		const url = window.location.href;
		const roomId = parseInt(url.substring(url.lastIndexOf('/') + 1));
		localStorage.setItem('roomId', roomId);
		window.location.replace(window.location.origin);
	}, []);

	return (
		<div></div>
	)
}

export default Redirect;