import React, { useState } from 'react';
import ScrollableFeed from 'react-scrollable-feed';
import moment from 'moment';
import { useEffect } from 'react';
import {
    receiveMessage,
    sendGetAllMessages,
    getAllMessages,
} from '../../api/socketApi';
import { useMessages } from '../../contexts/MessagesContext';
import { useNotification } from '../../contexts/NotificationContext';


function Messages() {
    const [localUser, setLocalUser] = useState({})
    const { sendedMessages, setSendedMessages } = useMessages()
    const [visibility, setVisibility] = useState(true)
    const { notification } = useNotification(true)


    // console.log('Messages Rendered');
    useEffect(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        setLocalUser(user);

        function handleVisibilityChange() {
            if (document.visibilityState === "visible") {
                setVisibility(true);
            } else {
                setVisibility(false);
            }
        }

        document.addEventListener("visibilitychange", handleVisibilityChange, false);

        sendGetAllMessages()
        getAllMessages((data) => {
            setSendedMessages(data)
            // console.log(data);
        })
        receiveMessage((data) => {
            console.log('newMessage');
            const notf = JSON.parse(localStorage.getItem('notification'))
            if (document.visibilityState === 'hidden' && notf) {
                playSound()
            }
            document.visibilityState === 'hidden' && (data['unseen'] = true)
            setSendedMessages(prev => [...prev, data])
        })
    }, [setSendedMessages])

    useEffect(() => {
        localStorage.setItem('notification', notification)
    }, [notification])

    function playSound() {
        // console.log('played');
        if (localStorage.getItem('notification')) {
            const audio = new Audio('https://notificationsounds.com/storage/sounds/file-sounds-1233-elegant.mp3')
            audio.volume = 0.4
            return audio.play();
        }
    }

    const handleClass = (data) => {
        if (data.unseen && !visibility) {
            return 'unseen'
        } else {
            data.unseen = false
            return 'seen'
        }
    }

    return (
        <ScrollableFeed forceScroll={true} className="messages">
            {sendedMessages.map((data, i) => {
                return (
                    <div key={i} className={`message ${localUser.id === data.user.id ? 'self' : ''} ${handleClass(data)}`}>
                        <div className="msgDetail">
                            <span className="userName">{data.user.userName}</span>
                            <span className="date">{moment.unix(data.time / 1000).format('HH:mm')}</span>
                        </div>
                        <div className="msgContent">
                            {data.msg}
                        </div>
                    </div>)

            })}
        </ScrollableFeed>
    )
}

export default Messages