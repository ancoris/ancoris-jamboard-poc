import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
    collection,
    getFirestore,
    query,
    orderBy,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import Modal from "react-modal";
import Note from "./Note";
import "./App.css";

const firebaseConfig = {
    apiKey: "AIzaSyBV5VkmvxT2_vyaU0hZwIe3Cx7xZtW5bb4",
    authDomain: "ancoris-jamboard-poc.firebaseapp.com",
    projectId: "ancoris-jamboard-poc",
    storageBucket: "ancoris-jamboard-poc.appspot.com",
    messagingSenderId: "1009172427197",
    appId: "1:1009172427197:web:312f041e091bfd5ed5e2d4",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

Modal.setAppElement("#root");

function App() {
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [notes, setNotes] = useState([]);
    const [noteContent, setNoteContent] = useState("");
    const [imageFile, setImageFile] = useState(null);
    const [canvas, setCanvas] = useState(null);

    useEffect(() => {
        const q = query(collection(db, "notes"), orderBy("created"));
        const unsubscribe = onSnapshot(
            q,
            (querySnapshot) => {
                const notesArray = [];
                querySnapshot.forEach((doc) => {
                    notesArray.push({ id: doc.id, ...doc.data() });
                });
                setNotes(notesArray);
            },
            (error) => {
                console.error("Error fetching notes: ", error);
            }
        );

        return () => unsubscribe();
    }, []);

    const openModal = () => {
        setModalIsOpen(true);
    };

    const closeModal = () => {
        setModalIsOpen(false);
    };

    const addNote = async () => {
        try {
            let imageUrl = null;

            if (imageFile) {
                const storageRef = ref(
                    storage,
                    `images/${Date.now()}_${imageFile.name}`
                );
                await uploadBytes(storageRef, imageFile);
                imageUrl = await getDownloadURL(storageRef);
            }

            const newNote = {
                content: noteContent,
                imageUrl,
                x: 0,
                y: 0,
                width: 200,
                height: 200,
                backgroundColor: "#ffffff",
                created: Date.now(),
            };

            await addDoc(collection(db, "notes"), newNote);
            setNoteContent("");
            setImageFile(null);
        } catch (error) {
            console.error("Error adding note: ", error);
        }
    };

    const deleteNote = async (id) => {
        try {
            await deleteDoc(doc(db, "notes", id));
        } catch (error) {
            console.error("Error deleting note: ", error);
        }
    };

    const updateNotePosition = async (id, x, y) => {
        try {
            await updateDoc(doc(db, "notes", id), { x, y });
        } catch (error) {
            console.error("Error updating note position: ", error);
        }
    };

    const updateNoteSize = async (id, width, height) => {
        try {
            await updateDoc(doc(db, "notes", id), { width, height });
        } catch (error) {
            console.error("Error updating note size: ", error);
        }
    };

    const updateNoteColor = async (id, backgroundColor) => {
        try {
            await updateDoc(doc(db, "notes", id), { backgroundColor });
        } catch (error) {
            console.error("Error updating note color: ", error);
        }
    };

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const customStyles = {
      content: {
        width: '300px',
        height: '200px',
        margin: 'auto',
        padding: '20px',
      },
    };

    return (
        <div className="App">
            <button onClick={openModal}>Add Notes</button>

            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                contentLabel="Add Notes Modal"
                style={customStyles}
            >
                <button onClick={closeModal}>Close</button>
                <div className="note-input">
                    <textarea
                        value={noteContent}
                        onChange={(e) => setNoteContent(e.target.value)}
                        placeholder="Type your note here..."
                    />
                    <button onClick={addNote}>Add Note</button>
                </div>
            </Modal>

            <div className="notes-container">
                {notes.map((note) => (
                    <Note
                        key={note.id}
                        id={note.id}
                        content={note.content}
                        imageUrl={note.imageUrl}
                        x={note.x}
                        y={note.y}
                        width={note.width}
                        height={note.height}
                        backgroundColor={note.backgroundColor}
                        onDelete={deleteNote}
                        onMove={updateNotePosition}
                        onResizeStop={updateNoteSize}
                        onColorChange={updateNoteColor}
                    />
                ))}
            </div>
        </div>
    );
}

export default App;
