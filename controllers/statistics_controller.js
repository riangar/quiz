var models = require('../models/models.js');

// GET /quizes/statistics
exports.view = function(req, res) {
	// Inicializamos las estadísticas y sus valores
	var statistics = { numPreguntas: 0,
					   numComentariosTotales: 0,
					   numMedioComentariosPorPregunta: 0,
					   numPreguntasSinComentarios: 0,
					   numPreguntasConComentarios: 0
					};

	// Obtenemos el número total de preguntas
	models.Quiz.count().then(function(quizes) {
		statistics.numPreguntas = quizes;
	}).then(function() {

		// Obtenemos el número total de comentarios y hallamos el promedio de comentarios por pregunta
		models.Comment.count().then(function(comments) {
			statistics.numComentariosTotales = comments;
			if (statistics.numPreguntas > 0){  // Validamos que el número de preguntas sea mayor que cero
				statistics.numMedioComentariosPorPregunta = (statistics.numComentariosTotales/statistics.numPreguntas).toFixed(2);
			}
		}).then(function() {

			// Obtenemos el número de preguntas sin comentarios y hallamos el número de pregunta con comentarios
			models.Quiz.count({where: ['id NOT IN (SELECT distinct "QuizId" FROM "Comments")']}).then(function(quizesSinComentarios) {
				statistics.numPreguntasSinComentarios = quizesSinComentarios;
				statistics.numPreguntasConComentarios = statistics.numPreguntas - statistics.numPreguntasSinComentarios;
			}).then(function(){
				res.render('quizes/statistics', {statistics: statistics, errors: []});
			});
		});
	});
};

