export function uploadSchedule(req, res) {

    if (req.file) {
        res.status(200).send({ message: "Schedule uploaded!" })
    }
    else {
        res.status(500).send({ message: "Failed to upload schedule!" })
    }

}