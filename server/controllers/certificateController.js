import Certificate from '../models/Certificate.js';
import Skill from '../models/Skill.js';
import { generateCredentialId } from '../utils/tokenUtils.js';

export const getUserCertificates = async (req, res, next) => {
  try {
    let certificates = await Certificate.find({ user: req.user.id })
      .populate('user', 'name email')
      .sort({ issuedDate: -1 });

    // Populate skill only if it exists, and add skillName as fallback
    certificates = await Promise.all(certificates.map(async (cert) => {
      const certObj = cert.toObject();
      console.log('Certificate skillName:', certObj.skillName, 'skill:', certObj.skill);
      if (cert.skill) {
        try {
          await cert.populate('skill', 'title');
          certObj.skill = cert.skill;
        } catch (e) {
          // Skill might have been deleted
          certObj.skill = null;
        }
      }
      return certObj;
    }));

    console.log('Fetched certificates for user:', req.user.id, 'Count:', certificates.length);

    res.status(200).json({
      success: true,
      certificates
    });
  } catch (error) {
    console.error('Error fetching certificates:', error);
    next(error);
  }
};

// Create a demo certificate for testing
export const createDemoCertificate = async (req, res, next) => {
  try {
    // Find a skill to associate with the certificate
    let skill = await Skill.findOne({ isActive: true });
    
    // If no skill exists, create a demo skill
    if (!skill) {
      skill = await Skill.create({
        title: 'Machine Learning Fundamentals',
        name: 'Machine Learning Fundamentals',
        description: 'Learn the fundamentals of Machine Learning',
        category: 'Machine Learning',
        difficulty: 'Intermediate',
        isActive: true
      });
    }

    const credentialId = generateCredentialId();

    const certificate = await Certificate.create({
      user: req.user.id,
      skill: skill._id,
      skillName: skill.title || skill.name,
      certificateId: credentialId,
      score: Math.floor(Math.random() * 20) + 80, // Random score between 80-100
      issuedDate: new Date(),
      status: 'active'
    });

    await certificate.populate('user', 'name email');
    await certificate.populate('skill', 'title');

    res.status(201).json({
      success: true,
      message: 'Demo certificate created successfully',
      certificate
    });
  } catch (error) {
    next(error);
  }
};

export const getCertificateById = async (req, res, next) => {
  try {
    const certificate = await Certificate.findById(req.params.id)
      .populate('user', 'name email')
      .populate('skill', 'title');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.status(200).json({
      success: true,
      certificate
    });
  } catch (error) {
    next(error);
  }
};

export const createCertificate = async (req, res, next) => {
  try {
    const credentialId = generateCredentialId();

    const certificate = await Certificate.create({
      ...req.body,
      user: req.user.id,
      credentialId
    });

    await certificate.populate('skill', 'title');

    res.status(201).json({
      success: true,
      certificate
    });
  } catch (error) {
    next(error);
  }
};

export const verifyCertificate = async (req, res, next) => {
  try {
    const { credentialId } = req.params;

    const certificate = await Certificate.findOne({ credentialId })
      .populate('user', 'name email')
      .populate('skill', 'title');

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: 'Certificate not found'
      });
    }

    res.status(200).json({
      success: true,
      certificate
    });
  } catch (error) {
    next(error);
  }
};

export const getAllCertificates = async (req, res, next) => {
  try {
    const certificates = await Certificate.find({ isActive: true })
      .populate('user', 'name')
      .populate('skill', 'title')
      .sort({ issueDate: -1 });

    res.status(200).json({
      success: true,
      certificates
    });
  } catch (error) {
    next(error);
  }
};
