// React - Notification component
const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  
  useEffect(() => {
    // Listen for various events
    socket.on('friend_request_received', (data) => {
      addNotification({
        type: 'friend_request',
        message: `${data.sender.username} sent you a friend request`,
        data
      });
    });
    
    socket.on('message_received', (data) => {
      if (!isConversationActive(data.conversationId)) {
        addNotification({
          type: 'new_message',
          message: `New message from ${data.sender.username}`,
          data
        });
      }
    });
  }, []);
};

export default NotificationCenter;