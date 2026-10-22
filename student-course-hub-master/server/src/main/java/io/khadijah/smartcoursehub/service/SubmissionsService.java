package io.khadijah.smartcoursehub.service;

import io.khadijah.smartcoursehub.dto.SubmissionsDTO;
import io.khadijah.smartcoursehub.entity.Submissions;
import io.khadijah.smartcoursehub.repository.SubmissionsRepository;
import io.khadijah.smartcoursehub.vo.SubmissionsQueryVO;
import io.khadijah.smartcoursehub.vo.SubmissionsUpdateVO;
import io.khadijah.smartcoursehub.vo.SubmissionsVO;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.util.NoSuchElementException;

@Service
public class SubmissionsService {

    @Autowired
    private SubmissionsRepository submissionsRepository;

    public Long save(SubmissionsVO vO) {
        Submissions bean = new Submissions();
        BeanUtils.copyProperties(vO, bean);
        bean = submissionsRepository.save(bean);
        return bean.getId();
    }

    public void delete(Long id) {
        submissionsRepository.deleteById(id);
    }

    public void update(Long id, SubmissionsUpdateVO vO) {
        Submissions bean = requireOne(id);
        BeanUtils.copyProperties(vO, bean);
        submissionsRepository.save(bean);
    }

    public SubmissionsDTO getById(Long id) {
        Submissions original = requireOne(id);
        return toDTO(original);
    }

    public Page<SubmissionsDTO> query(SubmissionsQueryVO vO) {
        throw new UnsupportedOperationException();
    }

    private SubmissionsDTO toDTO(Submissions original) {
        SubmissionsDTO bean = new SubmissionsDTO();
        BeanUtils.copyProperties(original, bean);
        return bean;
    }

    private Submissions requireOne(Long id) {
        return submissionsRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Resource not found: " + id));
    }
}
