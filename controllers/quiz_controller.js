var models = require('../models/models.js');

//Autoload - factoriza el código si ruta incluye :quizId
exports.load = function(req, res, next, quizId) {
	models.Quiz.find(quizId).then(
		function(quiz) {
			if (quiz) {
				req.quiz = quiz;
				next();
			} else { next(new Error('No existe quizId=' + quizId)); }
		}
	).catch(function(error) { next(error);});
};

// GET /quizes
exports.index = function(req, res) {
	var search = req.query.search || '';
	search = search.replace(/ /g, '%');
	search = '%' + search + '%';
	models.Quiz.findAll({where: ['UPPER(pregunta) like UPPER(?)', search]}).then(function(quizes) {
		res.render('quizes/index', { quizes: quizes, errors: []});
	});
};

// GET /quizes/:id
exports.show = function(req, res) {
	res.render('quizes/show', {quiz: req.quiz, errors: []});
};

// GET /quizes/:id/answer
exports.answer = function(req, res) {
	var resultado = 'Incorrecto';
   	if (req.query.respuesta ===  req.quiz.respuesta){
   	  resultado = 'Correcto';
   	}
   	res.render('quizes/answer', { quiz: req.quiz, respuesta: resultado, errors: [] });		
};

// GET /quizes/new
exports.new = function(req, res) {
	var quiz = models.Quiz.build ( // crea objeto quiz
		{pregunta: "Pregunta", respuesta: "Respuesta"}
	);
	
	res.render('quizes/new', {quiz: quiz, errors: []});
};

// PUT /quizes/create
exports.create = function(req, res) {
	var quiz = models.Quiz.build ( req.body.quiz);
	
	var errors = quiz.validate(); //ya que el objeto errors no tiene then(
	if (errors)	{
		var i = 0; 
		var errores = new Array();//se convierte en [] con la propiedad message por compatibilidad con layout
		for (var prop in errors) errores[i++] = {message: errors[prop]};	
		res.render('quizes/new', {quiz: quiz, errors: errores});
	} else {
		quiz // save: guarda en DB campos pregunta y respuesta de quiz
		.save({fields: ["pregunta", "respuesta"]})
		.then( function(){ 
			res.redirect('/quizes'); // redirige al listado de preguntas
		}); 
	}
};

// GET /quizes/:id/edit
exports.edit = function(req, res) {
	var quiz = req.quiz;
	
	res.render('quizes/edit', {quiz: quiz, errors: []});
};

// PUT /quizes/:id
exports.update = function(req, res) {
	req.quiz.pregunta = req.body.quiz.pregunta;
	req.quiz.respuesta = req.body.quiz.respuesta //el id ya nos viene del Autoload
	
	var quiz = req.quiz;

	var errors = quiz.validate(); //ya que el objeto errors no tiene then(
	if (errors)	{
		var i = 0; 
		var errores = new Array();//se convierte en [] con la propiedad message por compatibilidad con layout
		for (var prop in errors) errores[i++] = {message: errors[prop]};	
		res.render('quizes/edit', {quiz: quiz, errors: errores});
	} else {
		quiz // save: guarda en DB campos pregunta y respuesta de quiz
		.save({fields: ["pregunta", "respuesta"]})
		.then( function(){ 
			res.redirect('/quizes'); // redirige al listado de preguntas
		}); 
	}
};

// DELETE /quizes/:id
exports.destroy = function(req, res) {
	req.quiz.destroy().then(function(){
		res.redirect('/quizes');
	}).catch(function(error) { next(error)});
};