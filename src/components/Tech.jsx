import React, { useEffect, useState } from 'react';
import './Tech.css';

const Tech = () => {
    const [tickets, setTickets] = useState([]);
    const [activeTicket, setActiveTicket] = useState(null);
    const [responseText, setResponseText] = useState('');
    const [status, setStatus] = useState({});
    const [showPopup, setShowPopup] = useState(false); // Popup state

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch('http://localhost:5000/api/tickets', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTickets(data);
            } else {
                console.error('Error fetching tickets:', response.statusText);
            }
        } catch (error) {
            console.error('Error fetching tickets:', error);
        }
    };

    const handleStatusChange = async (ticketId, newStatus) => {
        setStatus((prevStatus) => ({
            ...prevStatus,
            [ticketId]: newStatus
        }));

        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (!response.ok) {
                console.error('Error updating status:', response.statusText);
            } else {
                fetchTickets(); // Refresh the tickets list
            }
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const forwardToAdmin = async (ticketId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}/forward`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ forwardToAdmin: true })  // Mark ticket for Admin view
            });

            if (response.ok) {
                setShowPopup(true);  // Show success popup
                fetchTickets();  // Refresh the ticket list after forwarding
            } else {
                console.error('Error forwarding ticket to Admin:', response.statusText);
            }
        } catch (error) {
            console.error('Error forwarding ticket to Admin:', error);
        }
    };

    const toggleRespondBox = (ticketId) => {
        if (activeTicket === ticketId) {
            setActiveTicket(null);
        } else {
            setActiveTicket(ticketId);
            setResponseText('');
        }
    };

    const handleResponseChange = (event) => {
        setResponseText(event.target.value);
    };

    const handleSubmitResponse = async (ticketId) => {
        const token = localStorage.getItem('token');
        try {
            const response = await fetch(`http://localhost:5000/api/tickets/${ticketId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    response: responseText,
                    status: status[ticketId] || 'In progress'
                })
            });

            if (response.ok) {
                fetchTickets();
                setActiveTicket(null);
            } else {
                console.error('Error submitting response:', response.statusText);
            }
        } catch (error) {
            console.error('Error submitting response:', error);
        }
    };

    const closePopup = () => {
        setShowPopup(false);
    };

    return (
        <div>
            <div className="tech-header">
                <h1>Support Dashboard</h1>
            </div>
            <h2>All Inquiries</h2>

            {/* Success Popup */}
            {showPopup && (
                <div className="popup">
                    <div className="popup-content">
                        <p>Ticket has been successfully forwarded to the Admin!</p>
                        <button onClick={closePopup}>Close</button>
                    </div>
                </div>
            )}

            {tickets.length > 0 ? (
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Created By</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map((ticket) => (
                            <tr key={ticket._id} className={ticket.forwardToAdmin ? 'forwarded-ticket' : ''}>
                                <td>{ticket.title}</td>
                                <td>{ticket.description}</td>
                                <td>
                                    <select
                                        value={status[ticket._id] || ticket.status}
                                        onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                                        className="status-dropdown"
                                    >
                                        <option value="Open">Open</option>
                                        <option value="In progress">In Progress</option>
                                        <option value="Closed">Closed</option>
                                    </select>
                                </td>
                                <td>{ticket.createdBy.username}</td>
                                <td>
                                    <button 
                                        onClick={() => toggleRespondBox(ticket._id)} 
                                        className="respond-btn"
                                    >
                                        {activeTicket === ticket._id ? 'Close' : 'Respond'}
                                    </button>
                                    {activeTicket === ticket._id && (
                                        <div>
                                            <textarea 
                                                value={responseText} 
                                                onChange={handleResponseChange} 
                                                placeholder="Write your response here"
                                            />
                                            <button 
                                                onClick={() => handleSubmitResponse(ticket._id)} 
                                                className="submit-response-btn"
                                            >
                                                Submit Response
                                            </button>
                                        </div>
                                    )}
                                    <button 
                                        onClick={() => forwardToAdmin(ticket._id)} 
                                        className="forward-btn"
                                    >
                                        Forward to Admin
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            ) : (
                <p>No inquiries found</p>
            )}
        </div>
    );
};

export default Tech;
