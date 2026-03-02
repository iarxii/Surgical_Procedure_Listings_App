<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProcedureIcdMapping extends Model
{
    protected $fillable = ['procedure_id', 'icd_code_id', 'mapping_type'];

    public function procedure()
    {
        return $this->belongsTo(Procedure::class);
    }

    public function icdCode()
    {
        return $this->belongsTo(IcdCode::class);
    }
}
