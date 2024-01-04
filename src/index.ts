import app  from './server';
import './bot';

app.listen(4000, () => {
  console.log('Server started on port 4000');
});