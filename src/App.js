import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios'; // Import Axios library
import './App.css';

function Post({ post, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedContent, setUpdatedContent] = useState(post.content);

  const handleEditChange = (e) => {
    setUpdatedContent(e.target.value);
  };

  const handleUpdate = async () => {
    try {
      const response = await axios.put(`http://localhost:8080/api/notes/${post.id}`, {
        content: updatedContent
      });

      if (!response.data) {
        throw new Error('Failed to update post');
      }

      onUpdate(post.id, updatedContent);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  return (
    <div className="post">
      {isEditing ? (
        <textarea
          value={updatedContent}
          onChange={handleEditChange}
          autoFocus
          rows={Math.ceil(updatedContent.length / 50) + 1}
        ></textarea>
      ) : (
        <p>{post.content}</p>
      )}
      <div className="post-details">
        <span className="author">{post.author}</span>
        <span className="timestamp">{post.timestamp}</span>
        <div className="actions">
          {!isEditing && <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit</button>}
          <button className="delete-btn" onClick={() => onDelete(post.id)}>Delete</button>
          {isEditing && <button className="update-btn" onClick={handleUpdate}>Update</button>}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [posts, setPosts] = useState([]);
  const [newPostContent, setNewPostContent] = useState('');

  const textareaRef = useRef(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/notes');
      if (!response.data) {
        throw new Error('Failed to fetch posts');
      }
      setPosts(response.data);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handlePostChange = (e) => {
    setNewPostContent(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  };

  const handlePostSubmit = async () => {
    if (newPostContent.trim() === '') return;

    try {
        const currentDate = new Date().toISOString();
        console.log(currentDate);
        const postData = {
            user: 'CurrentUser',
            title: 'New Post',
            content: newPostContent,
            localdatetime: currentDate,
        };

        const response = await axios.post('http://localhost:8080/api/notes', postData);

        if (!response.data) {
            throw new Error('Failed to create post');
        }

        setPosts([response.data, ...posts]);
        setNewPostContent('');
    } catch (error) {
        console.error('Error creating post:', error);
    }
};

const handleDelete = async (postId) => {
  try {
    // Make the DELETE request
    await axios.delete(`http://localhost:8080/api/notes/${postId}`);

    // Update the posts state by removing the deleted post
    setPosts(posts.filter(post => post.id !== postId));
  } catch (error) {
    console.error('Error deleting post:', error);
  }
};


  const handleUpdate = async (postId, updatedContent) => {
    try {
      const response = await axios.put(`http://localhost:8080/api/notes/${postId}`, {
        content: updatedContent
      });

      if (!response.data) {
        throw new Error('Failed to update post');
      }

      setPosts(posts.map(post =>
        post.id === postId ? { ...post, content: updatedContent } : post
      ));
    } catch (error) {
      console.error('Error updating post:', error);
    }
  };

  return (
    <div className="App">
      <h1>Nonote-app</h1>
      <div className="post-form">
        <textarea
          ref={textareaRef}
          placeholder="What's on your mind?"
          value={newPostContent}
          onChange={handlePostChange}
          rows={Math.ceil(newPostContent.length / 50) + 1}
          maxLength={280}
        ></textarea>
        <button className="post-btn" onClick={handlePostSubmit}>Post</button>
      </div>
      <div className="post-feed">
        {posts.map((post) => (
          <Post key={post.id} post={post} onDelete={handleDelete} onUpdate={handleUpdate} />
        ))}
      </div>
    </div>
  );
}

export default App;
