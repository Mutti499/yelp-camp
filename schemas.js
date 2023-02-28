const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');// in order to prevent Cross Site Scripting attacks like putting input <script>alert(some stuff)</script>

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({ // We are taking inputs in campground object so I need to check the object first then its properties..
        title: Joi.string().required().escapeHTML(),
        //image: Joi.string().required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML(),
    }).required(),
    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({ 
        comment: Joi.string().required().escapeHTML(),
        rate: Joi.number().required().min(1).max(5),
    }).required()

});

module.exports.passwordSchema = Joi.object({
    password: Joi.string().required(),
    password2: Joi.string().required().valid(Joi.ref('password')).messages({
        "any.only": "The two passwords do not match",
        "any.required": "Please re-enter the password",
      }),
  })