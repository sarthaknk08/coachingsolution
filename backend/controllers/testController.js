const Test = require("../models/Test");
const TestScore = require("../models/TestScore");
const StudentProfile = require("../models/StudentProfile");

// Create Test
exports.createTest = async (req, res) => {
  try {
    const { name, description, batch, subject, totalMarks, testDate, resultDate, testType } = req.body;

    const test = await Test.create({
      name,
      description,
      batch,
      subject,
      totalMarks,
      testDate,
      resultDate,
      testType,
      createdBy: req.user._id,
    });

    const populatedTest = await Test.findById(test._id).populate("batch", "name className");

    res.status(201).json(populatedTest);
  } catch (err) {
    console.error("TEST CREATE ERROR:", err);
    res.status(500).json({ message: "Failed to create test" });
  }
};

// Get all tests for admin
exports.getTests = async (req, res) => {
  try {
    const tests = await Test.find()
      .populate("batch", "name className")
      .populate("createdBy", "name email")
      .sort({ testDate: -1 });

    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get tests for a batch
exports.getTestsByBatch = async (req, res) => {
  try {
    const { batchId } = req.params;

    const tests = await Test.find({ batch: batchId })
      .populate("batch", "name className")
      .sort({ testDate: -1 });

    res.json(tests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get tests for current student's batch (for student dashboard)
exports.getTestsByBatchForStudent = async (req, res) => {
  try {
    const StudentProfile = require("../models/StudentProfile");
    const userId = req.user.id;

    // Find student profile for this user
    const studentProfile = await StudentProfile.findOne({ user: userId });
    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Get tests for student's batch
    const tests = await Test.find({ batch: studentProfile.batch })
      .populate("batch", "name")
      .sort({ testDate: -1 });

    res.json({
      success: true,
      data: tests,
    });
  } catch (err) {
    console.error("GET TESTS BY BATCH FOR STUDENT ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Update test
exports.updateTest = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, subject, totalMarks, testDate, resultDate, testType, status } = req.body;

    const test = await Test.findById(id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    test.name = name || test.name;
    test.description = description || test.description;
    test.subject = subject || test.subject;
    test.totalMarks = totalMarks || test.totalMarks;
    test.testDate = testDate || test.testDate;
    test.resultDate = resultDate || test.resultDate;
    test.testType = testType || test.testType;
    test.status = status || test.status;

    await test.save();

    const updatedTest = await Test.findById(test._id)
      .populate("batch", "name className")
      .populate("createdBy", "name email");

    res.json(updatedTest);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete test (also deletes scores)
exports.deleteTest = async (req, res) => {
  try {
    const { id } = req.params;

    const test = await Test.findByIdAndDelete(id);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    // Delete all scores for this test
    await TestScore.deleteMany({ test: id });

    res.json({ message: "Test deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add/Update test scores
exports.addTestScore = async (req, res) => {
  try {
    const { testId, studentId, marksObtained, totalMarks, feedback, status } = req.body;

    // Validate required fields
    if (!testId || !studentId || marksObtained === undefined || !totalMarks) {
      return res.status(400).json({ 
        success: false,
        message: "Test ID, Student ID, marks, and total marks are required" 
      });
    }

    let testScore = await TestScore.findOne({ test: testId, student: studentId });

    if (testScore) {
      // Update existing
      testScore.marksObtained = marksObtained;
      testScore.totalMarks = totalMarks;
      testScore.feedback = feedback || testScore.feedback;
      testScore.status = status || testScore.status;
    } else {
      // Create new
      testScore = new TestScore({
        test: testId,
        student: studentId,
        marksObtained,
        totalMarks,
        feedback,
        status: status || "passed",
      });
    }

    // Save will trigger pre-save hook to calculate percentage and grade
    await testScore.save();

    const populatedScore = await TestScore.findById(testScore._id)
      .populate("test", "name subject totalMarks")
      .populate("student", "user rollNumber className");

    res.status(201).json({
      success: true,
      message: "Test score saved successfully",
      data: populatedScore
    });
  } catch (err) {
    console.error("TEST SCORE ERROR:", err);
    res.status(500).json({ 
      success: false,
      message: "Failed to save test score",
      error: err.message 
    });
  }
};

// Get test scores for a test
exports.getTestScores = async (req, res) => {
  try {
    const { testId } = req.params;

    const scores = await TestScore.find({ test: testId })
      .populate("student", "user rollNumber className")
      .populate({ path: "student", populate: { path: "user", select: "name email" } })
      .sort({ marksObtained: -1 });

    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get student's test scores
exports.getStudentTestScores = async (req, res) => {
  try {
    const { studentId } = req.params;

    const scores = await TestScore.find({ student: studentId })
      .populate("test", "name subject totalMarks testDate testType")
      .sort({ createdAt: -1 });

    res.json(scores);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get current student's test scores (for student dashboard)
exports.getMyTestScores = async (req, res) => {
  try {
    const StudentProfile = require("../models/StudentProfile");
    const userId = req.user.id;

    // Find student profile for this user
    const studentProfile = await StudentProfile.findOne({ user: userId });
    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    // Get all test scores for this student
    const scores = await TestScore.find({ student: studentProfile._id })
      .populate("test", "title subject maxMarks testDate")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: scores,
    });
  } catch (err) {
    console.error("GET MY TEST SCORES ERROR:", err);
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// Delete test score
exports.deleteTestScore = async (req, res) => {
  try {
    const { id } = req.params;

    const score = await TestScore.findByIdAndDelete(id);
    if (!score) {
      return res.status(404).json({ message: "Test score not found" });
    }

    res.json({ message: "Test score deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get test analytics
exports.getTestAnalytics = async (req, res) => {
  try {
    const { testId } = req.params;

    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ message: "Test not found" });
    }

    const scores = await TestScore.find({ test: testId });

    const passedCount = scores.filter((s) => s.percentage >= 50).length;
    const failedCount = scores.filter((s) => s.percentage < 50).length;
    const averageScore = scores.reduce((sum, s) => sum + s.marksObtained, 0) / scores.length || 0;
    const topperScore = Math.max(...scores.map((s) => s.marksObtained), 0);
    const lowestScore = Math.min(...scores.map((s) => s.marksObtained), 0);

    const analytics = {
      totalStudents: scores.length,
      passedStudents: passedCount,
      failedStudents: failedCount,
      averageScore: averageScore.toFixed(2),
      topperScore,
      lowestScore,
      passPercentage: scores.length > 0 ? ((passedCount / scores.length) * 100).toFixed(2) : 0,
    };

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
