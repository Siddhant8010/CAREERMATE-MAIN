const Question = require('../models/Question');
const Result = require('../models/Result');

// GET /test
exports.getTest = async (req, res) => {
  try {
    const questions = await Question.find({}).lean();
    
    console.log(`📚 Fetched ${questions.length} questions from database`);
    
    if (questions.length === 0) {
      console.warn('⚠️  No questions found in database. Please run: npm run seed:questions');
      return res.status(404).send(`
        <h1>No Questions Found</h1>
        <p>Please seed the database first by running:</p>
        <pre>npm run seed:questions</pre>
        <p>Then refresh this page.</p>
        <a href="/test">Refresh</a>
      `);
    }
    
    // Log question distribution
    const bySubject = {};
    questions.forEach(q => {
      bySubject[q.subject] = (bySubject[q.subject] || 0) + 1;
    });
    console.log('📊 Questions by subject:', bySubject);
    
    return res.render('test', { title: 'CareerMate Test', questions });
  } catch (err) {
    console.error('❌ Error fetching questions:', err);
    return res.status(500).send('Failed to load test. Check server logs for details.');
  }
};

// POST /submit-test
exports.submitTest = async (req, res) => {
  try {
    // Expecting req.body.answers as an object: { [questionId]: selectedAnswer }
    const bodyAnswers = req.body.answers || {};

    const questionIds = Object.keys(bodyAnswers);
    if (questionIds.length === 0) {
      return res.status(400).send('No answers submitted.');
    }

    const questions = await Question.find({ _id: { $in: questionIds } }).lean();

    let overallScore = 0;
    const subjectScores = { physics: 0, chemistry: 0, maths: 0, biology: 0 };
    const answers = [];
    const detailedAnswers = []; // For displaying on results page

    const questionMap = new Map(questions.map(q => [String(q._id), q]));

    for (const qId of questionIds) {
      const q = questionMap.get(String(qId));
      if (!q) continue;

      const selectedAnswer = bodyAnswers[qId];
      const isCorrect = selectedAnswer === q.correctAnswer;

      if (isCorrect) {
        overallScore += 1;
        const subj = (q.subject || '').toLowerCase();
        if (subjectScores.hasOwnProperty(subj)) {
          subjectScores[subj] += 1;
        }
      }

      answers.push({
        questionId: q._id,
        selectedAnswer,
        isCorrect,
      });

      // Add detailed answer info for results page
      detailedAnswers.push({
        questionText: q.questionText,
        subject: q.subject,
        selectedAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect,
        options: q.options,
      });
    }

    // Recommended Stream Logic
    let recommendedStream = 'Arts';
    if (subjectScores.physics + subjectScores.chemistry + subjectScores.maths >= 12) {
      recommendedStream = "Science";
    } else if (subjectScores.maths + subjectScores.chemistry >= 8) {
      recommendedStream = "Commerce";
    } else {
      recommendedStream = "Arts";
    }

    // Get userId and username from session
    const userId = req.session && req.session.user ? req.session.user._id : null;
    const username = req.session && req.session.user ? req.session.user.username : 'Anonymous';

    const resultDoc = await Result.create({
      userId,
      username,
      answers,
      overallScore,
      subjectScores,
      recommendedStream,
      date: new Date(),
    });
    
    console.log(`✅ Test submitted by user: ${username} (Score: ${overallScore}/${questions.length})`);

    return res.render('results', {
      title: 'Test Results',
      overallScore,
      subjectScores,
      recommendedStream,
      totalQuestions: questions.length,
      resultId: resultDoc._id,
      detailedAnswers, // Pass detailed answers to view
    });
  } catch (err) {
    console.error('Error submitting test:', err);
    return res.status(500).send('Failed to submit test.');
  }
};

// GET /result/:id - View a specific result by ID
exports.getResultById = async (req, res) => {
  try {
    const resultId = req.params.id;
    const result = await Result.findById(resultId).populate('answers.questionId').lean();

    if (!result) {
      return res.status(404).send('Result not found.');
    }

    // Build detailed answers from populated data
    const detailedAnswers = result.answers.map(ans => ({
      questionText: ans.questionId.questionText,
      subject: ans.questionId.subject,
      selectedAnswer: ans.selectedAnswer,
      correctAnswer: ans.questionId.correctAnswer,
      isCorrect: ans.isCorrect,
      options: ans.questionId.options,
    }));

    return res.render('results', {
      title: 'Test Results',
      overallScore: result.overallScore,
      subjectScores: result.subjectScores,
      recommendedStream: result.recommendedStream,
      totalQuestions: result.answers.length,
      resultId: result._id,
      detailedAnswers,
    });
  } catch (err) {
    console.error('Error fetching result:', err);
    return res.status(500).send('Failed to load result.');
  }
};
