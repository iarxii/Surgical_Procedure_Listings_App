<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class IcdCode extends Model
{
    protected $fillable = ['version', 'code', 'description'];

    public function procedures()
    {
        return $this->belongsToMany(Procedure::class, 'procedure_icd_mappings')
            ->withPivot('mapping_type')
            ->withTimestamps();
    }
}
