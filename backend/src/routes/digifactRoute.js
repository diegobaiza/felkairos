import request from 'request';

function digifactRoute(app) {

  app.get('/digifact/infonit/:nit/:nitC', (req, res) => {
    let url = `https://felgttestaws.digifact.com.gt/felapiv2/api/sharedInfo?NIT=${req.params.nit}&DATA1=SHARED_GETINFONITcom&DATA2=NIT|${req.params.nitC}&USERNAME=La_Lechita`;
    request({
      url: url,
      method: 'GET',
      headers: {
        'Authorization': req.headers.authorization
      },
      strictSSL: false
    }, function (error, response, body) {
      if (error) {
        res.status(200).json(JSON.parse(error));
      } else {
        res.status(200).json(JSON.parse(body));
      }
    });
  });

  app.post('/digifact/token', (req, res) => {
    let url = `https://felgttestaws.digifact.com.gt/felapiv2/api/login/get_token`;
    request({
      url: url,
      method: 'POST',
      headers: {
        "content-type": "application/json",
      },
      strictSSL: false,
      body: req.body,
      json: true
    }, function (error, response, body) {
      if (error) {
        res.status(200).json(JSON.parse(error));
      } else {
        res.status(200).json(body);
      }
    });
  });

  app.post('/digifact/certificar/:nit', (req, res) => {
    let url = `https://felgttestaws.digifact.com.gt/felapiv2/api/FelRequest?NIT=${req.params.nit}&TIPO=CERTIFICATE_DTE_XML_TOSIGN&FORMAT=XML`;
    request({
      url: url,
      method: 'POST',
      headers: {
        'Authorization': req.headers.authorization
      },
      strictSSL: false,
      body: req.body
    }, function (error, response, body) {
      if (error) {
        res.status(200).json(JSON.parse(error));
      } else {
        res.status(200).json(JSON.parse(body));
      }
    });
  });

  app.post('/digifact/anular/:nit', (req, res) => {
    let url = `https://felgttestaws.digifact.com.gt/felapiv2/api/FelRequest?NIT=${req.params.nit}&TIPO=ANULAR_FEL_TOSIGN&FORMAT=XML`;
    request({
      url: url,
      method: 'POST',
      headers: {
        'Authorization': req.headers.authorization
      },
      strictSSL: false,
      body: req.body
    }, function (error, response, body) {
      if (error) {
        res.status(200).json(JSON.parse(error));
      } else {
        res.status(200).json(JSON.parse(body));
      }
    });
  });

} export default digifactRoute;