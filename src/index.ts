import app  from './server';
import './bot';
import { notifyMe } from './bot';

app.listen(4000, () => {
  console.log('Server started on port 4000');
  notifyMe("Server started on port 4000");
});