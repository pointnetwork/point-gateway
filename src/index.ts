import { server } from './web2server';

server.listen(5000, (err, address) => {
  if (err) {
    console.error(err);
  } else {
    console.info({ address }, 'Success');
  }
});
