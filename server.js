import app from './app';

// Render define a porta via process.env.PORT
const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
