const ChatHeader = () => {
    return (
        <div className="chat-container-header">
            <div className="profile">
                <div className="img-container">
                    <img src="client/src/components/ChatHeader" alt="logo"/>
                </div>
                <h3>UserName</h3>
            </div>
            <i className="log-out-icon">⇦</i>
    </div>
    )
}

export default ChatHeader